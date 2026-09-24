// Only the owner admitted by Sites can access this application.
const OWNER_EMAIL = "luce.romuald@gmail.com";
const headers = {"X-Robots-Tag":"noindex, nofollow, noarchive","Cache-Control":"no-store","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer"};
const reply = (body, status=200) => Response.json(body,{status,headers});
const BRIEFING_MAIL_ACCOUNT = 'romuald.mcdo22028@gmail.com';
const successfulCollection = value => ['ok','none'].includes(value?.status);
const objectBlock = value => value && typeof value==='object' && !Array.isArray(value) ? value : null;
const collectionTimestamp = value => value?.checkedAt||value?.lastSuccessfulCollection||value?.lastAttemptAt||'';
const validCollectionTimestamp = value => Number.isFinite(Date.parse(collectionTimestamp(value)));
const SOURCE_DEFINITIONS=[['mail','Gmail professionnel',['gmail','mail']],['medallia','Medallia',['medallia']],['clearview','Clearview GO',['clearview','clearviewgo']],['mchire','McHire',['mchire']],['employeeOfMonth','McD Connect',['blink','mcdconnect','employeeofmonth']]];
const mergeSourceEvidence = (value, proof) => {
  const next=objectBlock(value)||{}, reference=objectBlock(proof)||{}, merged={...reference,...next};
  for(const field of ['checkedAt','lastSuccessfulCollection','lastAttemptAt']){
    const stamps=[next[field],reference[field]].filter(v=>Number.isFinite(Date.parse(v||''))).sort((a,b)=>Date.parse(a)-Date.parse(b));
    if(stamps.length)merged[field]=stamps.at(-1);
  }
  return merged;
};
const sourceMetadata = (incoming,key) => {
  const definition=SOURCE_DEFINITIONS.find(([id])=>id===key);
  if(!definition)return null;
  return objectBlock((incoming.sources||[]).find(source=>definition[2].includes(String(source.id||'').toLowerCase().replace(/[^a-z]/g,''))));
};
const sourceBlock = (briefing,key) => key==='clearview'||key==='medallia'
  ? objectBlock(briefing?.restaurantDashboard?.[key])||objectBlock(briefing?.[key])
  : objectBlock(briefing?.[key]);
const collectionProof = (key, value, proof) => {
  const next=objectBlock(value), reference=objectBlock(proof);
  if(!next)return false;
  if(next.status&&!successfulCollection(next))return false;
  if(reference?.status&&!successfulCollection(reference))return false;
  const checked=mergeSourceEvidence(next,reference);
  if(!successfulCollection(checked)||!validCollectionTimestamp(checked))return false;
  if(key==='mail')return checked.account===BRIEFING_MAIL_ACCOUNT&&(Array.isArray(checked.items)||typeof checked.summary==='string');
  if(key==='medallia')return Array.isArray(checked.metrics)||Array.isArray(checked.weekly)||checked.responseCount!=null||checked.rawRecordCount!=null||typeof checked.periodLabel==='string';
  if(key==='clearview')return typeof checked.date==='string'||objectBlock(checked.sales)||objectBlock(checked.cash)||Array.isArray(checked.channels)||objectBlock(checked.labour)||objectBlock(checked.speed);
  if(key==='mchire')return Array.isArray(checked.items)||typeof checked.summary==='string';
  if(key==='employeeOfMonth')return Array.isArray(checked.responses)||Array.isArray(checked.items)||typeof checked.summary==='string';
  return true;
};
const hasNewSourceProof = (previous,incoming) => SOURCE_DEFINITIONS.some(([key])=>{
  const block=sourceBlock(incoming,key), proof=sourceMetadata(incoming,key), old=sourceBlock(previous,key);
  if(!collectionProof(key,block,proof))return false;
  const currentAt=collectionTimestamp(mergeSourceEvidence(block,proof)), previousAt=collectionTimestamp(old);
  return validCollectionTimestamp({checkedAt:currentAt})&&(!validCollectionTimestamp(old)||Date.parse(currentAt)>Date.parse(previousAt));
});

function preserveSource(previous, incoming, generatedAt, previousGeneratedAt, key='generic', proof=null) {
  const old=objectBlock(previous), next=objectBlock(incoming), reference=objectBlock(proof), candidate=next?mergeSourceEvidence(next,reference):null;
  const candidateAt=collectionTimestamp(candidate), oldAt=collectionTimestamp(old);
  const hasNewVerification=validCollectionTimestamp(candidate)&&(!validCollectionTimestamp(old)||Date.parse(candidateAt)>Date.parse(oldAt));
  if(collectionProof(key,next,reference)&&hasNewVerification){
    const successfulAt=candidate.checkedAt||candidate.lastSuccessfulCollection||candidate.lastAttemptAt;
    return {...next,dataState:'available',lastSuccessfulCollection:successfulAt,lastAttemptAt:candidate.lastAttemptAt||candidate.checkedAt||successfulAt,consecutiveFailures:0};
  }
  const status=(successfulCollection(next)||successfulCollection(reference))?'error':next?.status||reference?.status||'error';
  const retained=old&&(successfulCollection(old)||old.dataState==='cached'||old.lastSuccessfulCollection);
  return {...(retained?old:next||{}),status,dataState:retained?'cached':'unavailable',lastAttemptAt:candidate?.lastAttemptAt||candidate?.checkedAt||generatedAt,
    ...(retained?{lastSuccessfulCollection:old.lastSuccessfulCollection||old.checkedAt||previousGeneratedAt}:{}),
    consecutiveFailures:(Number(old?.consecutiveFailures)||0)+1,
    note:next?.note||next?.error||next?.summary||'Cette source n’a pas fourni une collecte vérifiable lors de la dernière exécution.'};
}

export function mergeBriefing(previous, incoming) {
  if(previous&&Date.parse(incoming.generatedAt)<Date.parse(previous.generatedAt))return previous;
  const result={...incoming}, old=previous||{}, at=incoming.generatedAt;
  let mail=objectBlock(incoming.mail);
  if(successfulCollection(mail)&&mail.account!==BRIEFING_MAIL_ACCOUNT)mail={status:'error',note:'La collecte ne confirme pas la boîte professionnelle attendue.'};
  result.mail=preserveSource(old.mail?.account===BRIEFING_MAIL_ACCOUNT?old.mail:null,mail,at,old.generatedAt,'mail',sourceMetadata(incoming,'mail'));
  for(const key of ['medallia','mchire','employeeOfMonth'])result[key]=preserveSource(old[key],incoming[key],at,old.generatedAt,key,sourceMetadata(incoming,key));
  const oldDashboard=objectBlock(old.restaurantDashboard), nextDashboard=objectBlock(incoming.restaurantDashboard);
  if(oldDashboard||nextDashboard){
    const dashboard={...(oldDashboard||{}),...(nextDashboard||{})};
    for(const key of ['medallia','clearview'])dashboard[key]=preserveSource(oldDashboard?.[key],nextDashboard?.[key]||incoming[key],at,old.generatedAt,key,sourceMetadata(incoming,key));
    if(!nextDashboard?.priorities?.length&&!['medallia','clearview'].every(key=>successfulCollection(nextDashboard?.[key]))){
      dashboard.priorities=oldDashboard?.priorities||[];
      dashboard.executiveSummary=oldDashboard?.executiveSummary||nextDashboard?.executiveSummary||'';
      dashboard.asOf=oldDashboard?.asOf||nextDashboard?.asOf;
    }
    result.restaurantDashboard=dashboard;
  }
  result.sources=SOURCE_DEFINITIONS.map(([key,label,aliases])=>{
    const source=(incoming.sources||[]).find(s=>aliases.includes(String(s.id||'').toLowerCase().replace(/[^a-z]/g,'')));
    const block=key==='clearview'?result.restaurantDashboard?.clearview:result[key];
    return {...(source||{}),id:key,label:source?.label||label,status:block?.status||source?.status||'error',lastSuccessfulCollection:block?.lastSuccessfulCollection||source?.lastSuccessfulCollection||null,lastAttemptAt:block?.lastAttemptAt||at,dataState:block?.dataState||'unavailable'};
  });
  if(result.sources.some(s=>!['ok','none'].includes(s.status)))result.status='partial';
  return result;
}

// --- Fraîcheur et collecteur externe (v59) ---------------------------------
// Un HTTP 200 ne veut plus dire « à jour » : le serveur calcule lui-même l'âge
// du bilan et de chaque source, avec la date du jour à St-Jovite.
const MAX_FEED_AGE_MS=75*60*1000;
const COLLECTOR_KEYS=['mail','medallia','clearview','mchire','employeeOfMonth'];
const FAILURE_STATES=['reauth_required','error','not_available','partial','stale'];
const torontoDay=(date=new Date(Date.now()))=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Toronto',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
const sameSecret=(a,b)=>{a=String(a||'');b=String(b||'');if(!a||!b||a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;};
const readRow=async(env,id)=>{const row=await env.DB.prepare("SELECT body FROM gestion_documents WHERE id = ?").bind(id).first();return row?.body?JSON.parse(row.body):null;};

// Temps de service, heures et signaux de main-d'oeuvre : acceptés seulement pour la journée en cours.
// La comparaison sameDayLastYear est conservée.
export function enforceSameDayService(block,today=torontoDay()){
  if(!block||block.date===today)return block;
  const {labour,speed,peakSales,staffingSignals,...rest}=block;
  if(!labour&&!speed&&!peakSales&&!staffingSignals)return block;
  return {...rest,serviceRejected:'Temps de service et heures reçus pour le '+(block.date||'date inconnue')+', pas pour le '+today+'; ils sont ignorés.'};
}

// Superpose les lectures poussées par le collecteur (POST /api/collector) sur le bilan du flux.
// Une lecture réussie n'est retenue que si elle est plus récente que celle du bilan.
// Un échec plus récent remplace l'état, mais garde la dernière donnée fiable en cache.
export function overlayCollector(briefing,live){
  if(!briefing||!live?.sources)return briefing;
  const result={...briefing};
  if(briefing.restaurantDashboard)result.restaurantDashboard={...briefing.restaurantDashboard};
  for(const key of COLLECTOR_KEYS){
    const entry=objectBlock(live.sources[key]);if(!entry)continue;
    const inDashboard=key==='clearview'||key==='medallia';
    const current=inDashboard?(result.restaurantDashboard?.[key]||result[key]):result[key];
    const entryAt=Date.parse(entry.checkedAt||entry.lastAttemptAt||'');if(!Number.isFinite(entryAt))continue;
    const currentAt=Date.parse(collectionTimestamp(current)||'');
    const lastAttempt=Date.parse(current?.lastAttemptAt||'');
    let next;
    if(successfulCollection(entry)){
      if(Number.isFinite(currentAt)&&entryAt<=currentAt)continue;
      next={...entry,dataState:'available',lastSuccessfulCollection:entry.checkedAt,lastAttemptAt:entry.checkedAt,consecutiveFailures:0,collectedBy:'collecteur'};
    }else{
      if(Number.isFinite(lastAttempt)&&entryAt<=lastAttempt)continue;
      const hasData=Boolean(current&&(current.lastSuccessfulCollection||successfulCollection(current)));
      next={...(current||{}),status:entry.status,note:entry.note||current?.note,lastAttemptAt:entry.lastAttemptAt||entry.checkedAt,dataState:hasData?'cached':'unavailable',collectedBy:'collecteur'};
    }
    if(inDashboard){result.restaurantDashboard={...(result.restaurantDashboard||{}),[key]:next};}
    result[key]=next;
    result.sources=(result.sources||[]).map(s=>s.id===key?{...s,status:next.status,dataState:next.dataState,lastSuccessfulCollection:next.lastSuccessfulCollection||s.lastSuccessfulCollection||null,lastAttemptAt:next.lastAttemptAt||s.lastAttemptAt,note:next.note||s.note}:s);
  }
  result.status=(result.sources||[]).some(s=>!['ok','none'].includes(s.status))?'partial':(result.status==='partial'?'complete':result.status);
  return result;
}

// Verdict de fraîcheur calculé côté serveur, ajouté à chaque réponse du briefing.
export function withFreshness(body,now=Date.now()){
  if(!body||typeof body!=='object')return body;
  const generated=Date.parse(body.generatedAt||''),age=Number.isFinite(generated)?now-generated:null;
  const today=torontoDay(new Date(now));
  const sources=(body.sources||[]).map(s=>{
    const at=Date.parse(s.lastSuccessfulCollection||'');
    const ageMinutes=Number.isFinite(at)?Math.max(0,Math.round((now-at)/60000)):null;
    return {...s,ageMinutes,fresh:['ok','none'].includes(s.status)&&ageMinutes!==null&&ageMinutes*60000<=MAX_FEED_AGE_MS};
  });
  const clearview=body.restaurantDashboard?.clearview;
  const out={...body,sources,serverCheckedAt:new Date(now).toISOString(),today,feedAgeMinutes:age===null?null:Math.max(0,Math.round(age/60000)),clearviewIsToday:clearview?.date===today};
  if(age===null||age>MAX_FEED_AGE_MS){
    out.feedState='stale';
    out.feedMessage=(age===null?'Bilan sans horodatage valide.':'Aucun nouveau bilan depuis '+Math.round(age/60000)+' min : le collecteur externe ne produit plus de données.')+(body.feedState==='stale'&&body.feedMessage?' '+body.feedMessage:'');
  }
  return out;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // Sites validates these identity headers before dispatch. Some owner sessions
    // forward the verified email without the optional user ID. Visitor passes
    // still require the ID to bind the invitation to the signed-in account.
    // Point d'entrée du collecteur externe. Désactivé tant que le secret COLLECTOR_TOKEN n'est pas défini.
    if(url.pathname==='/api/collector'){
      if(!env.COLLECTOR_TOKEN)return new Response("Introuvable",{status:404,headers});
      if(request.method!=='POST')return reply({error:'Méthode non autorisée'},405);
      if(!sameSecret((request.headers.get('authorization')||'').replace(/^Bearer\s+/i,''),env.COLLECTOR_TOKEN))return reply({error:'Jeton refusé.'},401);
      return collectorIngest(request,env);
    }
    const userEmail=request.headers.get('oai-authenticated-user-email')?.trim().toLowerCase();
    const isOwner=userEmail===OWNER_EMAIL;
    if (!userEmail || (!isOwner && !request.headers.get('oai-authenticated-user-id')))
      return new Response("Connexion requise.",{status:403,headers});
    try {
      const special=await visitorRoutes(request,env,isOwner);if(special)return special;
      const visit=isOwner?null:await passSession(request,env);
      if(!isOwner&&!visit){
        if(url.pathname==='/'&&request.method==='GET')return new Response(passGate(),{headers:{...headers,'Content-Type':'text/html; charset=utf-8'}});
        return reply({error:'Accès visiteur expiré ou absent.'},403);
      }
      if(!isOwner&&request.method!=='GET')return reply({error:'Consultation uniquement.'},403);
      if(!isOwner&&!(url.pathname==='/'||url.pathname==='/api/data'||url.pathname==='/api/weather'||url.pathname==='/assets/portrait-romuald.png'||url.pathname==='/outils/suivi-perfectionnement.html'))return reply({error:'Document réservé au propriétaire.'},403);
      if(url.pathname==='/api/daily-briefing'&&request.method==='GET'){
        if(!isOwner)return reply({error:'Document réservé au propriétaire.'},403);
        let reason='Source automatique indisponible.';
        let live=null;try{live=await readRow(env,'collector-live');}catch{}
        const briefingReply=body=>reply(withFreshness(overlayCollector(body,live)));
        try {
          if(!env.BRIEFING_FEED_URL)throw Error('Flux non configuré.');
          const response=await fetch(env.BRIEFING_FEED_URL,{headers:{'Accept':'application/json'},signal:AbortSignal.timeout(12000)});
          if(!response.ok)throw Error('Le flux ne répond pas ('+response.status+').');
          const body=await response.text();
          if(body.length>500000)throw Error('Bilan trop volumineux.');
          const briefing=JSON.parse(body);
          if(!briefing||briefing.schemaVersion!==1||typeof briefing.date!=='string'||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(briefing.date)||typeof briefing.generatedAt!=='string'||!/[T ]/.test(briefing.generatedAt)||!/(Z|[+-][0-9]{2}:[0-9]{2})$/.test(briefing.generatedAt)||!Number.isFinite(Date.parse(briefing.generatedAt))||!Array.isArray(briefing.sources))throw Error('Bilan incomplet ou non horodaté.');
          if(Date.parse(briefing.generatedAt)>Date.now()+15*60*1000)throw Error('Bilan horodaté dans le futur.');
          const existing=await env.DB.prepare("SELECT body FROM gestion_documents WHERE id = ?").bind('briefing-cache').first();
          const previous=existing?.body?JSON.parse(existing.body):null;
          const incomingAt=Date.parse(briefing.generatedAt), previousAt=Date.parse(previous?.generatedAt||0);
          if(!previous||incomingAt>previousAt||(incomingAt===previousAt&&hasNewSourceProof(previous,briefing))){
            if(briefing.restaurantDashboard?.clearview)briefing.restaurantDashboard={...briefing.restaurantDashboard,clearview:enforceSameDayService(briefing.restaurantDashboard.clearview)};
            const merged=mergeBriefing(previous,briefing),mergedBody=JSON.stringify(merged);
            if(mergedBody!==existing?.body){
              const write=await env.DB.prepare("INSERT INTO gestion_documents (id, body, revision) VALUES (?, ?, 1) ON CONFLICT(id) DO UPDATE SET body = excluded.body, revision = revision + 1 WHERE julianday(json_extract(excluded.body, '$.generatedAt')) >= julianday(json_extract(gestion_documents.body, '$.generatedAt'))").bind('briefing-cache',mergedBody).run();
              if(!write.meta.changes){
                const latest=await env.DB.prepare("SELECT body FROM gestion_documents WHERE id = ?").bind('briefing-cache').first();
                if(latest?.body)return briefingReply({...JSON.parse(latest.body),feedState:'available'});
              }
            }
            return briefingReply({...merged,feedState:'available'});
          }
          if(Date.parse(briefing.generatedAt)===Date.parse(previous.generatedAt||0))return briefingReply({...previous,feedState:'available'});
          return briefingReply({...previous,feedState:'stale',feedMessage:'Le flux a retourné un bilan plus ancien.'});
        } catch(error){reason=error?.message||reason;}
        const saved=await env.DB.prepare("SELECT body FROM gestion_documents WHERE id = ?").bind('briefing-cache').first();
        if(saved?.body)return briefingReply({...JSON.parse(saved.body),feedState:'stale',feedMessage:reason});
        return reply({error:'Aucun bilan récent enregistré. '+reason},503);
      }
      if(url.pathname==='/outils/suivi-perfectionnement.html'&&request.method==='GET')return new Response(PERF_HTML,{headers:{...headers,'Content-Type':'text/html; charset=utf-8'}});
      if(url.pathname==='/api/weather'&&request.method==='GET'){
        const date=url.searchParams.get('date');
        if(!/^\d{4}-\d{2}-\d{2}$/.test(date||''))return reply({error:'Date invalide'},400);
        const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Toronto',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
        const days=(Date.parse(date)-Date.parse(today))/86400000;
        if(days<0||days>15)return reply({available:false});
        const response=await fetch('https://api.open-meteo.com/v1/forecast?latitude=46.11532&longitude=-74.57191&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=America%2FToronto&forecast_days=16',{signal:AbortSignal.timeout(10000)});
        if(!response.ok)return reply({error:'Météo indisponible'},502);
        const weather=await response.json(),d=weather.daily,i=d?.time?.indexOf(date)??-1;
        if(i<0||d.temperature_2m_max[i]==null||d.temperature_2m_min[i]==null||d.weather_code[i]==null)return reply({available:false});
        return reply({available:true,date,min:d.temperature_2m_min[i],max:d.temperature_2m_max[i],rain:d.precipitation_probability_max[i],code:d.weather_code[i],fetchedAt:new Date().toISOString()});
      }
      if(request.method==='GET'&&Object.hasOwn(ATTACHMENTS,url.pathname)){
        const file=ATTACHMENTS[url.pathname];
        return new Response(Uint8Array.from(atob(file.body),c=>c.charCodeAt(0)),{headers:{...headers,'Content-Type':file.type,'Content-Disposition':(['application/pdf','text/javascript'].includes(file.type)?'inline':'attachment')+'; filename="'+file.file+'"'}});
      }
      if (url.pathname === "/" && request.method === "GET")
        return new Response(isOwner?APP_HTML:renderVisitorHtml(visit),{headers:{...headers,"Content-Type":"text/html; charset=utf-8"}});
      if (url.pathname !== "/api/data") return new Response("Introuvable",{status:404,headers});
      if (request.method === "GET") {
        const row = await env.DB.prepare("SELECT body, revision FROM gestion_documents WHERE id = ?").bind("personnel").first();
        const document=row?JSON.parse(row.body):structuredClone(INITIAL_DATA);
        if(!isOwner)document.meta={delaiRappel:document.meta?.delaiRappel||7,menuMotion:document.meta?.menuMotion!==false,ts:1,lastRead:{}};
        return reply({document,revision:row?.revision||0});
      }
      if (request.method !== "PUT") return reply({error:"Méthode non autorisée"},405);
      if (request.headers.get("origin") !== url.origin || request.headers.get("x-stj-request") !== "1")
        return reply({error:"Origine refusée"},403);
      const raw = await request.text();
      if (raw.length > 2000000) return reply({error:"Données trop volumineuses"},413);
      const {document, revision} = JSON.parse(raw);
      if (!document || typeof document !== "object" || !Number.isInteger(revision) || revision < 0 ||
          !["employes","evaluations","formations","deleted"].every(k=>Array.isArray(document[k])))
        return reply({error:"Données invalides"},400);
      const body = JSON.stringify(document);
      const result = revision === 0
        ? await env.DB.prepare("INSERT OR IGNORE INTO gestion_documents (id, body, revision) VALUES (?, ?, 1)").bind("personnel",body).run()
        : await env.DB.prepare("UPDATE gestion_documents SET body = ?, revision = revision + 1 WHERE id = ? AND revision = ?").bind(body,"personnel",revision).run();
      if (!result.meta.changes) return reply({error:"Une autre modification a été enregistrée. Réessaie."},409);
      return reply({revision:revision+1});
    } catch (error) {
      console.error("Storage unavailable",error?.name);
      return reply({error:"Sauvegarde indisponible. Tes modifications restent à l’écran. Réessaie."},503);
    }
  }
};

// POST /api/collector : reçoit une lecture d'une seule source.
// Corps : {"source":"clearview","block":{"status":"ok","checkedAt":"2026-09-24T10:05:00-04:00","date":"2026-09-24",...}}
// Échec : {"source":"medallia","block":{"status":"reauth_required","checkedAt":"...","note":"Session expirée"}}
async function collectorIngest(request,env){
  try{
    const raw=await request.text();
    if(raw.length>300000)return reply({error:'Lecture trop volumineuse.'},413);
    const payload=JSON.parse(raw),key=String(payload?.source||'');
    if(!COLLECTOR_KEYS.includes(key))return reply({error:'Source inconnue : '+key},400);
    let block=objectBlock(payload.block);
    if(!block)return reply({error:'Bloc de données manquant.'},400);
    const stamp=block.checkedAt||block.lastAttemptAt||'',at=Date.parse(stamp);
    if(!Number.isFinite(at)||!/(Z|[+-][0-9]{2}:[0-9]{2})$/.test(stamp))return reply({error:'Horodatage absent ou sans fuseau.'},400);
    if(at>Date.now()+5*60*1000)return reply({error:'Horodatage dans le futur.'},400);
    if(Date.now()-at>6*60*60*1000)return reply({error:'Lecture de plus de 6 heures refusée.'},400);
    if(successfulCollection(block)){
      if(!block.checkedAt)return reply({error:'Une lecture réussie exige checkedAt.'},400);
      if(key==='clearview'){
        if(!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(block.date||''))return reply({error:'Clearview : champ date (AAAA-MM-JJ) obligatoire.'},400);
        block=enforceSameDayService(block);
      }
      if(key==='mail'&&block.account!==BRIEFING_MAIL_ACCOUNT)return reply({error:'Boîte courriel non reconnue.'},400);
      if(!collectionProof(key,block,null))return reply({error:'Lecture incomplète : aucune donnée vérifiable pour '+key+'.'},422);
    }else if(!FAILURE_STATES.includes(block.status))return reply({error:'Statut inconnu : '+block.status},400);
    const live=(await readRow(env,'collector-live'))||{sources:{}};
    live.sources={...(live.sources||{}),[key]:{...block,receivedAt:new Date().toISOString()}};
    live.updatedAt=new Date().toISOString();
    await env.DB.prepare("INSERT INTO gestion_documents (id, body, revision) VALUES (?, ?, 1) ON CONFLICT(id) DO UPDATE SET body = excluded.body, revision = revision + 1").bind('collector-live',JSON.stringify(live)).run();
    return reply({ok:true,source:key,status:block.status,serviceRejected:block.serviceRejected||null});
  }catch(error){
    const bad=error instanceof SyntaxError;
    return reply({error:bad?'JSON invalide.':'Enregistrement impossible.'},bad?400:503);
  }
}
