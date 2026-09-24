import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {DatabaseSync} from 'node:sqlite';
import worker,{withFreshness,overlayCollector,enforceSameDayService} from './dist/server/index.js';
// Fixtures synthétiques. Reproduit la situation du 24 septembre 2026 à 10:21 (heure de St-Jovite).
const NOW=Date.parse('2026-09-24T14:21:00Z');
const realNow=Date.now;Date.now=()=>NOW;
const sql=new DatabaseSync(':memory:');
for(const file of fs.readdirSync('drizzle').filter(x=>x.endsWith('.sql')).sort())sql.exec(fs.readFileSync('drizzle/'+file,'utf8'));
const prepared=(q,v=[])=>({bind(...a){return prepared(q,a)},async first(){return sql.prepare(q).get(...v)||null},async run(){return {meta:{changes:Number(sql.prepare(q).run(...v).changes)}}}});
const env={DB:{prepare:q=>prepared(q)},BRIEFING_FEED_URL:'https://feed.example.invalid/briefing',COLLECTOR_TOKEN:'jeton-test-0123456789'};
const owner={'oai-authenticated-user-email':'luce.romuald@gmail.com'};
const get=()=>worker.fetch(new Request('https://site.example/api/daily-briefing',{headers:owner}),env);
const post=(body,token=env.COLLECTOR_TOKEN,e=env)=>worker.fetch(new Request('https://site.example/api/collector',{method:'POST',headers:{authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify(body)}),e);
const originalFetch=globalThis.fetch;

// Bilan figé : dernière lecture Clearview réussie le 23 à 18:01, puis plus rien.
const oldAt='2026-09-23T22:01:00Z';
const frozen={schemaVersion:1,date:'2026-09-23',generatedAt:oldAt,sources:[{id:'clearview',status:'ok',checkedAt:oldAt},{id:'medallia',status:'ok',checkedAt:oldAt},{id:'mail',status:'ok',checkedAt:oldAt},{id:'mchire',status:'ok',checkedAt:oldAt},{id:'employeeOfMonth',status:'ok',checkedAt:oldAt}],
  mail:{status:'ok',account:'romuald.mcdo22028@gmail.com',checkedAt:oldAt,items:[]},mchire:{status:'ok',checkedAt:oldAt,items:[]},employeeOfMonth:{status:'ok',checkedAt:oldAt,responses:[]},medallia:{status:'ok',checkedAt:oldAt,metrics:[{label:'Satisfaction totale',value:97.1}]},
  restaurantDashboard:{asOf:'2026-09-23',medallia:{status:'ok',checkedAt:oldAt,metrics:[{label:'Satisfaction totale',value:97.1}]},clearview:{status:'ok',checkedAt:oldAt,date:'2026-09-23',sales:{product:8383.45},speed:{overall:90,fcfp:200,rap:130,unit:'s'}},priorities:[]}};
try{
  // 1. Le flux renvoie toujours le même vieux bilan : avant v59, feedState valait « available » avec HTTP 200.
  globalThis.fetch=async()=>Response.json(frozen);
  let res=await get();assert.equal(res.status,200);let body=await res.json();
  assert.equal(body.feedState,'stale');assert.match(body.feedMessage,/Aucun nouveau bilan depuis 980 min/);
  assert.equal(body.today,'2026-09-24');assert.equal(body.clearviewIsToday,false);
  assert.equal(body.sources.find(s=>s.id==='clearview').fresh,false);
  body=await(await get()).json();assert.equal(body.feedState,'stale','un second appel identique reste périmé');

  // 2. Route collecteur : désactivée sans secret, jeton obligatoire, anonyme toujours refusé ailleurs.
  assert.equal((await post({},'x',{...env,COLLECTOR_TOKEN:''})).status,404);
  assert.equal((await post({source:'clearview',block:{}},'mauvais-jeton-000000000')).status,401);
  assert.equal((await worker.fetch(new Request('https://site.example/api/daily-briefing'),env)).status,403);
  assert.equal((await worker.fetch(new Request('https://site.example/api/collector'),env)).status,405);

  // 3. Validation des lectures.
  const liveAt='2026-09-24T10:15:00-04:00';
  assert.equal((await post({source:'clearview',block:{status:'ok',checkedAt:'2026-09-24T10:15:00',date:'2026-09-24',sales:{product:1}}})).status,400,'fuseau obligatoire');
  assert.equal((await post({source:'clearview',block:{status:'ok',checkedAt:'2026-09-24T03:00:00-04:00',date:'2026-09-24',sales:{product:1}}})).status,400,'plus de 6 h');
  assert.equal((await post({source:'clearview',block:{status:'ok',checkedAt:liveAt,sales:{product:1}}})).status,400,'date Clearview obligatoire');
  assert.equal((await post({source:'inconnue',block:{status:'ok',checkedAt:liveAt}})).status,400);
  assert.equal((await post({source:'medallia',block:{status:'ok',checkedAt:liveAt}})).status,422,'lecture vide refusée');

  // 4. Temps de service de la veille refusés, même poussés par le collecteur.
  res=await post({source:'clearview',block:{status:'ok',checkedAt:liveAt,date:'2026-09-23',sales:{product:9000},speed:{overall:80,fcfp:190,rap:120,unit:'s'},labour:{hours:100},sameDayLastYear:{date:'2025-09-24',speed:{overall:88}}}});
  body=await res.json();assert.equal(res.status,200);assert.match(body.serviceRejected,/ignorés/);
  body=await(await get()).json();let cv=body.restaurantDashboard.clearview;
  assert.equal(cv.speed,undefined);assert.equal(cv.labour,undefined);assert.equal(cv.sales.product,9000);assert.equal(cv.sameDayLastYear.date,'2025-09-24');

  // 5. Lecture du jour même : superposée au bilan figé, avec ses temps de service.
  const todayAt='2026-09-24T10:20:00-04:00';
  res=await post({source:'clearview',block:{status:'ok',checkedAt:todayAt,date:'2026-09-24',sales:{product:2100.5,guestCount:180},speed:{overall:74,fcfp:181,rap:112,unit:'s',hotspots:[]},labour:{hours:22.5,salesPerLabourHour:93.36,transactionsPerLabourHour:8}}});
  assert.equal(res.status,200);
  body=await(await get()).json();cv=body.restaurantDashboard.clearview;
  assert.equal(cv.date,'2026-09-24');assert.equal(cv.speed.fcfp,181);assert.equal(cv.labour.hours,22.5);assert.equal(cv.dataState,'available');assert.equal(cv.collectedBy,'collecteur');
  assert.equal(body.clearviewIsToday,true);assert.equal(body.sources.find(s=>s.id==='clearview').fresh,true);

  // 6. Échec Medallia signalé par le collecteur : l'état change, la dernière donnée fiable reste.
  res=await post({source:'medallia',block:{status:'reauth_required',checkedAt:todayAt,note:'Session Medallia expirée.'}});assert.equal(res.status,200);
  body=await(await get()).json();
  assert.equal(body.restaurantDashboard.medallia.status,'reauth_required');assert.equal(body.restaurantDashboard.medallia.dataState,'cached');assert.equal(body.restaurantDashboard.medallia.metrics[0].value,97.1);
  assert.equal(body.status,'partial');

  // 7. Le front affiche les temps du jour seulement quand la lecture a moins de 75 min.
  const context=vm.createContext({htmlJournee(){},htmlElection(){},window:{setInterval(){}},document:{addEventListener(){}},esc:v=>String(v),aujISO:()=>'2026-09-24',Date,Intl});
  vm.runInContext(fs.readFileSync('daily-briefing.js','utf8'),context);
  const shown=context.dashboardPayload(body);assert.equal(shown.data.clearview.serviceDataState,'current');assert.equal(shown.data.clearview.speed.rap,112);
  assert.match(context.dashboardHeroDates({asOf:'2026-09-24'},{date:'2026-09-23'},{}),/ventes Clearview du 23 septembre 2026/);
  assert.equal(context.dashboardCachedTag({status:'ok',dataState:'available'}),'');
  assert.match(context.dashboardCachedTag({status:'reauth_required',dataState:'cached',lastSuccessfulCollection:oldAt}),/Dernière donnée fiable/);

  // 8. Fonctions pures.
  assert.equal(enforceSameDayService({date:'2026-09-24',speed:{overall:1}},'2026-09-24').speed.overall,1);
  assert.equal(withFreshness({generatedAt:new Date(NOW-10*60000).toISOString(),feedState:'available',sources:[]},NOW).feedState,'available');
  assert.equal(overlayCollector(frozen,null),frozen);
}finally{Date.now=realNow;globalThis.fetch=originalFetch;sql.close();}
console.log('PASS: vieux bilan déclaré périmé malgré HTTP 200, jeton collecteur, validation des lectures, temps de la veille refusés, lecture du jour superposée, échec de source conservant la dernière donnée, affichage du jour.');
