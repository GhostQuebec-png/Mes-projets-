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

// Fraîcheur calculée côté serveur, au fuseau du restaurant. Un HTTP 200 ne signifie
// plus « données à jour » : `health` dit, source par source, si la donnée est du jour.
const CLEARVIEW_MAX_AGE_MIN=75, SOURCE_MAX_AGE_MIN=150, BRIEFING_MAX_AGE_MIN=75;
export const torontoDate = (at=new Date()) => new Intl.DateTimeFormat('en-CA',{timeZone:'America/Toronto',year:'numeric',month:'2-digit',day:'2-digit'}).format(at);
const ageMinutes = (value, now) => { const t=Date.parse(value||''); return Number.isFinite(t)?Math.round((now-t)/60000):null; };
export function briefingHealth(briefing, now=Date.now()) {
  const today=torontoDate(new Date(now)), dashboard=objectBlock(briefing?.restaurantDashboard)||{};
  const briefingAge=ageMinutes(briefing?.generatedAt,now);
  const sources=SOURCE_DEFINITIONS.map(([key,label])=>{
    const block=key==='clearview'||key==='medallia'?objectBlock(dashboard[key])||objectBlock(briefing?.[key]):objectBlock(briefing?.[key]);
    const listed=(briefing?.sources||[]).find(s=>s.id===key)||{};
    const status=block?.status||listed.status||'error', lastSuccess=block?.lastSuccessfulCollection||listed.lastSuccessfulCollection||null, age=ageMinutes(lastSuccess,now);
    const ok=successfulCollection({status})&&block?.dataState!=='cached'&&block?.dataState!=='unavailable'&&age!==null&&age>=-5;
    let freshness=ok&&age<=(key==='clearview'?CLEARVIEW_MAX_AGE_MIN:SOURCE_MAX_AGE_MIN)?'current':lastSuccess?'stale':'unavailable', reason='';
    if(key==='clearview'&&freshness==='current'&&block?.date!==today){freshness='stale';reason='Données Clearview du '+(block?.date||'jour inconnu')+', pas du '+today+'.';}
    if(freshness!=='current'&&!reason)reason=status==='reauth_required'?'Session expirée : reconnexion requise dans le collecteur.':(block?.note||listed.note||(lastSuccess?'Aucune collecte réussie récente.':'Aucune collecte réussie enregistrée.'));
    return {id:key,label,status,freshness,dataDate:key==='clearview'?block?.date||null:null,lastSuccessfulCollection:lastSuccess,ageMinutes:age,reason};
  });
  const current=sources.filter(s=>s.freshness==='current').length;
  return {checkedAt:new Date(now).toISOString(),today,briefingAgeMinutes:briefingAge,briefingFresh:briefingAge!==null&&briefingAge<=BRIEFING_MAX_AGE_MIN,
    summary:current===sources.length&&briefingAge!==null&&briefingAge<=BRIEFING_MAX_AGE_MIN?'complete':current?'degraded':'down',sources};
}
const briefingReply = (body, status=200) => {
  const health=body&&!body.error?briefingHealth(body):null;
  return Response.json(health?{...body,health}:body,{status,headers:{...headers,...(health?{'X-Briefing-Health':health.summary}:{})}});
};

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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // Sites validates these identity headers before dispatch. Some owner sessions
    // forward the verified email without the optional user ID. Visitor passes
    // still require the ID to bind the invitation to the signed-in account.
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
        return briefingReply({error:'Aucun bilan récent enregistré. '+reason},503);
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
