// Tableau de bord privé, actualisé chaque heure par l'automatisation St-Jovite.
let dailyBriefingState={loading:false,loaded:false,data:null,error:''};
let dailyBriefingMerged='';
const briefingDayBase=htmlJournee;
const briefingElectionBase=htmlElection;

// Première photographie vérifiée. Elle reste affichée jusqu'au premier bilan horaire enrichi.
const DAILY_DASHBOARD_SNAPSHOT={
  verifiedOn:'2026-09-22',
  asOf:'2026-09-21',
  executiveSummary:'La satisfaction demeure très forte. Les priorités opérationnelles sont la propreté visible, la maîtrise des temps d’attente aux pointes et la constance des boissons et produits chauds.',
  medallia:{
    status:'ok',periodLabel:'30 derniers jours au 21 septembre 2026',responseCount:126,rawRecordCount:157,
    metrics:[
      {label:'Satisfaction totale',value:96.8,unit:'%',delta:1.1,comparison:'même période 2025',tone:'positive',explanation:'122 des 126 réponses avec score se situent dans la catégorie très satisfaite. Cette concentration explique le niveau élevé et la progression de 1,1 point.',solution:'Identifier les pratiques communes aux quarts les mieux notés, les reconnaître auprès de l’équipe et suivre les avis faibles pour éviter qu’un bon résultat global masque un problème local.'},
      {label:'Service au volant / réservé',value:99.2,unit:'%',delta:1.9,comparison:'même période 2025',tone:'positive',explanation:'120 réponses sont très positives et une seule est faible sur ce parcours. Le résultat indique une expérience généralement constante sur le principal canal du restaurant.',solution:'Préserver le positionnement, l’exactitude et la communication client, puis analyser séparément les heures où Clearview détecte une lenteur.'},
      {label:'Probabilité de recommandation',value:96.8,unit:'%',delta:1.1,comparison:'même période 2025',tone:'positive',explanation:'La recommandation progresse avec la satisfaction globale. Les clients satisfaits déclarent majoritairement qu’ils recommanderaient le restaurant.',solution:'Maintenir les standards qui soutiennent la satisfaction et demander aux gérants de partager une bonne pratique observée sur chaque quart.'},
      {label:'Exactitude',value:100,unit:'%',delta:2.6,comparison:'même période 2025',tone:'positive',explanation:'Toutes les réponses prises en compte dans cet indicateur sont favorables sur l’exactitude. Cela mesure le résultat agrégé, même si quelques commentaires isolés mentionnent encore des erreurs.',solution:'Conserver la vérification finale et le marquage des commandes; traiter les erreurs isolées comme des écarts de quart plutôt que considérer le risque éliminé.'},
      {label:'Propreté globale',value:97.6,unit:'%',delta:1.9,comparison:'même période 2025',tone:'positive',explanation:'Le score agrégé est élevé, mais six mentions négatives ont été repérées dans les avis faibles. Le niveau général est bon, avec des écarts probablement concentrés sur certaines périodes ou zones.',solution:'Conserver les standards actuels tout en traçant les contrôles de salle, toilettes, planchers et poubelles aux relèves et pendant les pointes.'},
      {label:'En restaurant',value:40,unit:'%',delta:-54.9,comparison:'échantillon de 5 réponses',caution:true,tone:'negative',explanation:'Ce résultat provient de seulement cinq réponses, dont deux très satisfaites, deux intermédiaires et une faible. Il signale un risque, mais l’échantillon est trop petit pour conclure que toute l’expérience en salle s’est dégradée.',solution:'Analyser individuellement les cinq parcours, renforcer la présence en salle aux heures concernées et attendre davantage de réponses avant de modifier durablement l’organisation.'}
    ],
    distribution:{top:122,middle:2,low:2},
    weekly:[
      {label:'24 août',value:91.9,count:37},{label:'31 août',value:96.6,count:29},{label:'7 sept.',value:100,count:39},{label:'14 sept.',value:100,count:9},{label:'21 sept.',value:100,count:12}
    ],
    strengths:['Exactitude à 100 %','Service au volant / réservé à 99,2 %','Propreté globale à 97,6 %'],
    themeSignals:[
      {label:'Attente et fluidité',count:10,tone:'negative',explanation:'Dix occurrences ont été repérées dans les avis faibles consultés. Elles parlent notamment de files lentes, d’un manque d’information et de clients en salle servis après le service au volant.',solution:'Croiser chaque avis avec l’heure, les ventes, le positionnement et les absences. Définir un déclencheur de renfort et une personne responsable d’informer les clients.'},
      {label:'Qualité ou température produit',count:8,tone:'negative',explanation:'Huit occurrences concernent notamment du café froid ou mal préparé et des produits servis froids ou secs. Le thème touche la préparation, la retenue et la remise au client.',solution:'Tracer les vérifications de calibration, fraîcheur, temps de retenue et températures à l’ouverture et aux relèves, puis comparer les plaintes avant et après.'},
      {label:'Propreté visible',count:6,tone:'negative',explanation:'Six occurrences concernent la salle, les planchers, les tables, les poubelles ou les toilettes. Cela suggère des écarts concentrés pendant certaines périodes plutôt qu’un échec uniforme.',solution:'Attribuer chaque zone à une personne par période, utiliser des contrôles tracés aux relèves et réagir dès que l’affluence interrompt la routine normale.'}
    ],
    scopeNote:'Les thèmes comptent les occurrences repérées dans les avis faibles consultés; ils ne remplacent pas le score officiel Medallia.',
    complaints:[
      {date:'2026-09-16',level:'high',title:'Propreté générale',detail:'Un avis décrit la salle et les zones visibles comme très sales. Le commentaire rejoint plusieurs signalements récents sur les planchers, tables, poubelles et toilettes.'},
      {date:'2026-09-14',level:'medium',title:'Qualité du café',detail:'Une commande de six cafés aurait comporté cinq boissons jugées mal préparées. La calibration, la fraîcheur et la recette sont à vérifier.'},
      {date:'2026-09-08',level:'high',title:'Attente et produits froids',detail:'Un client rapporte environ 15 minutes d’attente au service au volant malgré une faible file, puis des produits froids ou secs.'},
      {date:'2026-09-06',level:'critical',title:'Signalement de salubrité',detail:'Un client allègue que trois personnes auraient été malades après leur repas. Cette allégation n’est pas vérifiée et doit être traitée selon la procédure interne de traçabilité et de salubrité.'},
      {date:'2026-08-31',level:'high',title:'Attente, exactitude et récupération',detail:'Un avis mentionne environ 30 minutes d’attente, un produit incorrect et une interaction de gestion contestée. Les faits allégués doivent être vérifiés avec l’équipe concernée.'}
    ]
  },
  clearview:{
    status:'ok',date:'2026-09-21',
    sales:{gross:14622.12,net:12718.89,product:12651.62,guestCount:1009,averageCheck:12.54,refundCount:1,refundAmount:7.46,voidCount:19,voidAmount:58.24,discountCount:24,discountAmount:186.48},
    cash:{expectedDeposit:14758.21,actualDeposit:14700.13,variance:-58.08,tone:'negative',explanation:'Le dépôt réel est inférieur de 58,08 $ au dépôt attendu pour la journée. Le rapport indique l’écart, mais n’en donne pas la cause.',solution:'Vérifier les caisses, remboursements, commandes annulées, dépôts et pièces justificatives avant d’attribuer l’écart à une erreur précise.'},
    channels:[
      {label:'Service au volant',amount:6151.82,share:48.6},{label:'Kiosque',amount:3431.11,share:27.1},{label:'Comptoir',amount:2255.72,share:17.8},{label:'Mobile',amount:698.03,share:5.5},{label:'McLivraison',amount:114.94,share:.9}
    ],
    labour:{hours:120.75,salesPerLabourHour:104.78,transactionsPerLabourHour:8.36,cost:null,costRate:null,note:'Le coût et le pourcentage de main-d’œuvre ne sont pas renseignés dans le rapport.'},
    speed:{overall:86,fcfp:207,rap:137,unit:'s',hotspots:[
      {time:'12 h–13 h',sales:2025.72,overall:209,fcfp:291,rap:177,note:'plus forte heure de ventes',tone:'negative',explanation:'Cette heure représente 16,01 % des ventes produit et affiche simultanément la valeur de rapidité tous côtés la plus élevée. Le volume explique une partie de la pression, sans prouver à lui seul la cause.',solution:'Revoir le positionnement avant midi, les niveaux de préparation, le rôle du gérant et le déclenchement des renforts; mesurer ensuite la même tranche sur plusieurs jours.'},
      {time:'18 h–19 h',sales:1000.66,overall:97,fcfp:232,rap:118,note:'fort volume du souper',tone:'negative',explanation:'Le volume du souper est élevé et FCFP atteint 232. Il faut déterminer si l’écart vient du positionnement, de la préparation, d’un poste non maîtrisé ou d’un manque de ressources.',solution:'Comparer les postes occupés, les qualifications et les absences sur ce quart; déplacer ou accompagner les personnes seulement après avoir identifié le goulot.'},
      {time:'17 h–18 h',sales:865.69,overall:98,fcfp:175,rap:232,note:'RàP à surveiller',tone:'negative',explanation:'La valeur RàP est nettement plus élevée que FCFP sur cette tranche. Cela pointe vers une attente après la première étape du parcours, sans en identifier automatiquement la cause.',solution:'Observer le parcours réel, la disponibilité des produits et la coordination remise/attentes; noter le goulot avant de modifier les effectifs.'},
      {time:'20 h–21 h',sales:406.14,overall:73,fcfp:257,rap:193,note:'lenteur malgré un volume plus faible',tone:'negative',explanation:'Les valeurs FCFP et RàP restent élevées alors que les ventes sont plus faibles. Cela rend le volume seul insuffisant pour expliquer la lenteur.',solution:'Vérifier la compétence aux postes, les pauses, les tâches de nettoyage et la motivation de l’équipe sur cette période; corriger la cause confirmée.'}
    ]},
    peakSales:[
      {time:'12 h–13 h',sales:2025.72,share:16.01,labourHours:9,salesPerLabourHour:225.08},
      {time:'11 h–12 h',sales:1076.47,share:8.51,labourHours:8.5,salesPerLabourHour:126.64},
      {time:'13 h–14 h',sales:1043.22,share:8.25,labourHours:9,salesPerLabourHour:115.91},
      {time:'18 h–19 h',sales:1000.66,share:7.91,labourHours:8.02,salesPerLabourHour:124.77}
    ],
    staffingSignals:[
      {time:'12 h–13 h',title:'Capacité sous forte pression',detail:'Pic de ventes et productivité élevée, mais temps de service le plus lent : vérifier le positionnement plutôt que conclure à un simple manque d’effectif.',solution:'Comparer la prévision, les présences, les qualifications et le positionnement sur plusieurs dîners avant de changer l’horaire.'},
      {time:'15 h–16 h',title:'Productivité à examiner',detail:'9,57 heures travaillées pour un VPHT de 54,25. Comparer avec les tâches de relève, de nettoyage et de préparation avant d’ajuster.',solution:'Distinguer les heures réellement affectées à la production des tâches nécessaires de relève et de propreté, puis ajuster seulement les écarts non justifiés.'}
    ]
  },
  priorities:[
    {level:'critical',title:'Sécuriser le suivi salubrité',evidence:'Une allégation client non vérifiée et un signalement distinct de coquille d’œuf.',action:'Retracer les quarts, lots et contrôles concernés; appliquer la procédure interne et consigner la conclusion.',measure:'Traçabilité complétée et actions correctives documentées.'},
    {level:'high',title:'Reprendre la propreté visible',evidence:'Six occurrences repérées dans les avis faibles : salle, planchers, tables, poubelles et toilettes.',action:'Attribuer un responsable par période et tracer les contrôles aux relèves et pendant les pointes.',measure:'Contrôles réalisés, écarts corrigés et évolution des mentions de propreté.'},
    {level:'high',title:'Fluidifier le dîner',evidence:'12 h–13 h représente 16,01 % des ventes produit et affiche 209 / 291 / 177 sur les trois mesures de rapidité.',action:'Revoir le positionnement, le déclenchement des renforts et la prise en charge de la salle avant la pointe.',measure:'Temps Clearview par tranche et nombre d’avis liés à l’attente.'},
    {level:'medium',title:'Stabiliser café et produits chauds',evidence:'Signalements répétés de café mal préparé ou froid et de produits servis froids ou secs.',action:'Vérifier calibration, fraîcheur, temps de retenue et températures à l’ouverture puis aux relèves.',measure:'Contrôles conformes et absence de répétition sur les prochains avis.'},
    {level:'medium',title:'Renforcer la récupération client',evidence:'Des avis évoquent un manque d’information pendant l’attente et une interaction de gestion contestée.',action:'Définir qui informe, estime l’attente et prend en charge la récupération pendant chaque pointe.',measure:'Alertes traitées, délai de réponse et évolution des notes faibles.'}
  ]
};

function briefingStatusLabel(status){return ({ok:'À jour',none:'Rien à signaler',partial:'Partiel',stale:'Dernière donnée',reauth_required:'Connexion perdue · reconnexion à tenter',error:'Erreur technique',not_available:'Non disponible'}[status]||'En attente');}
function briefingStatusClass(status){return status==='reauth_required'||status==='error'?'problem':status==='ok'?'ready':status==='partial'||status==='stale'?'caution':'quiet';}
function briefingTime(value){if(!value)return '';const d=new Date(value);return Number.isNaN(d.getTime())?'':d.toLocaleTimeString('fr-CA',{hour:'2-digit',minute:'2-digit'});}
function briefingDateTime(value){if(!value)return '';const d=new Date(value);return Number.isNaN(d.getTime())?'':d.toLocaleString('fr-CA',{dateStyle:'long',timeStyle:'short'});}
function briefingDate(value){if(!value)return '';const d=new Date(String(value).slice(0,10)+'T12:00:00');return Number.isNaN(d.getTime())?String(value):d.toLocaleDateString('fr-CA',{day:'numeric',month:'long',year:'numeric'});}
function briefingNumber(value,digits=0){return value!==null&&value!==undefined&&value!==''&&Number.isFinite(Number(value))?Number(value).toLocaleString('fr-CA',{minimumFractionDigits:digits,maximumFractionDigits:digits}):'—';}
function briefingMoney(value){return value!==null&&value!==undefined&&value!==''&&Number.isFinite(Number(value))?Number(value).toLocaleString('fr-CA',{style:'currency',currency:'CAD'}):'—';}
function briefingUnavailable(value,unit=''){return value!==null&&value!==undefined&&value!==''&&Number.isFinite(Number(value))?briefingNumber(value)+(unit?' '+unit:''):'Donnée indisponible';}
function briefingList(items,empty){return items?.length?'<ul class="briefing-list">'+items.map(x=>'<li><strong>'+esc(x.title||x.subject||'À retenir')+'</strong><span>'+esc(x.detail||x.summary||'')+'</span>'+(x.action?'<span><b>Action :</b> '+esc(x.action)+'</span>':'')+'</li>').join('')+'</ul>':'<p class="briefing-empty">'+esc(empty)+'</p>';}
function briefingSourceFreshness(source){
  const value=source?.lastSuccessfulCollection||source?.checkedAt;
  const date=value?(String(value).length===10?briefingDate(value):briefingDateTime(value)):'';
  return '<p class="briefing-source-freshness">'+(source?.dataState==='cached'?'Dernière donnée fiable conservée':'Dernière collecte réussie')+' : '+esc(date||'date non confirmée')+'.</p>';
}
function briefingSourceMessage(source,{kind='source',items=[]}={}){
  const status=source?.status;
  if(kind==='mail'&&['ok','none'].includes(status)&&!items.length)return 'Aucun courriel à relever depuis la dernière collecte confirmée.';
  if(status==='reauth_required')return kind==='mail'?'Connexion Gmail perdue ou à renouveler. Reconnexion automatique tentée; la dernière donnée fiable est conservée.':'Connexion perdue ou à renouveler. Reconnexion automatique tentée; la dernière donnée fiable est conservée.';
  if(status==='error')return source?.note|| (kind==='mail'?'Erreur technique pendant la lecture de Gmail. La dernière donnée fiable est conservée; une nouvelle tentative sera faite automatiquement.':'Erreur technique pendant la lecture de cette source. La dernière donnée fiable est conservée.');
  if(status==='partial')return source?.note||'Collecte partielle : certaines données sont encore à vérifier.';
  if(status==='stale')return source?.note||'Collecte en retard : la dernière donnée fiable est conservée.';
  if(['ok','none'].includes(status)&&!items.length)return kind==='mail'?'Aucun courriel à relever depuis la dernière collecte confirmée.':'Aucune action à signaler depuis la dernière collecte confirmée.';
  if(status==='not_available')return source?.note||'Source non disponible pour cette collecte; la dernière donnée fiable est conservée.';
  return source?.summary||(items.length?'':'Collecte non confirmée : aucune lecture validée pour cette source.');
}
function dashboardObject(value){return value&&typeof value==='object'&&!Array.isArray(value)?value:null;}
function dashboardHasNumber(value){return value!==null&&value!==undefined&&value!==''&&Number.isFinite(Number(value));}
function dashboardCollectionTimestamp(block,source){return block?.lastSuccessfulCollection||source?.lastSuccessfulCollection||block?.checkedAt||source?.checkedAt||null;}
function dashboardClearviewIsCurrent(block,source){
  if(!block||block.status!=='ok'||(source?.status&&source.status!=='ok')||['cached','unavailable'].includes(block.dataState)||block.date!==aujISO())return false;
  const timestamp=Date.parse(dashboardCollectionTimestamp(block,source)||'');if(!Number.isFinite(timestamp))return false;
  const age=Date.now()-timestamp;return age>=-5*60*1000&&age<=75*60*1000;
}
function dashboardTimestampLabel(value){
  const timestamp=Date.parse(value||'');if(!Number.isFinite(timestamp))return '';
  return new Intl.DateTimeFormat('fr-CA',{timeZone:'America/Toronto',dateStyle:'long',timeStyle:'short'}).format(new Date(timestamp));
}
// Comparaison annuelle : même jour de semaine, 364 jours plus tôt (jeudi contre jeudi).
function dashboardYearAgoDate(date){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(String(date||'')))return '';
  const d=new Date(String(date)+'T12:00:00Z');return Number.isNaN(d.getTime())?'':new Date(d.getTime()-364*86400000).toISOString().slice(0,10);
}
function briefingWeekdayDate(value){if(!value)return '';const d=new Date(String(value).slice(0,10)+'T12:00:00');return Number.isNaN(d.getTime())?String(value):d.toLocaleDateString('fr-CA',{weekday:'long',day:'numeric',month:'long',year:'numeric'});}
function dashboardSameDayLastYear(value){
  const candidate=dashboardObject(value?.sameDayLastYear)||dashboardObject(value?.comparison?.sameDayLastYear)||dashboardObject(value?.yearAgo);
  if(!candidate)return null;
  const date=String(candidate.date||candidate.asOf||'').slice(0,10);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return null;
  // Une comparaison qui ne tombe pas sur le même jour de semaine est refusée plutôt qu'affichée à tort.
  const reference=dashboardYearAgoDate(value?.date||aujISO());
  if(reference&&date!==reference)return null;
  const hasNested=['sales','labour','speed'].some(key=>dashboardObject(candidate[key])&&Object.values(candidate[key]).some(dashboardHasNumber));
  const hasDirect=Object.entries(candidate).some(([key,val])=>key!=='date'&&key!=='asOf'&&dashboardHasNumber(val));
  return hasNested||hasDirect?{...candidate,date}:null;
}
function dashboardPayload(briefing){
  const live=briefing?.restaurantDashboard, data={...(live||DAILY_DASHBOARD_SNAPSHOT)};let isSnapshot=!live,hasYearAgo=false,yearAgoDate='';
  for(const key of ['medallia','clearview']){
    const block=live?.[key],hasData=key==='medallia'?Boolean(block&&(block.metrics?.length||block.weekly?.length||block.responseCount!=null||block.rawRecordCount!=null)):Boolean(block&&(typeof block.date==='string'||(block.sales&&Object.values(block.sales).some(value=>dashboardHasNumber(value)))||(block.cash&&Object.values(block.cash).some(value=>dashboardHasNumber(value)))||block.channels?.length||block.labour||block.speed));
    if(hasData){
      if(key==='clearview'){
        const source=briefing?.sources?.find(item=>item.id==='clearview'),collectedAt=dashboardCollectionTimestamp(block,source),liveCurrent=dashboardClearviewIsCurrent(block,source);
        const merged={...block,clearviewFreshness:liveCurrent?'current':'stale',clearviewReadAt:collectedAt},comparison=dashboardSameDayLastYear(block);
        // Une collecte mise en cache ne doit jamais alimenter les temps de service du jour.
        // Les ventes restent lisibles avec leur date, mais la mesure opérationnelle est explicitement indisponible.
        const labourHasNumber=dashboardObject(block?.labour)&&Object.values(block.labour).some(dashboardHasNumber),speedHasNumber=dashboardObject(block?.speed)&&Object.entries(block.speed).some(([key,value])=>key!=='hotspots'&&key!=='unit'&&dashboardHasNumber(value)),hasHotspots=Array.isArray(block?.speed?.hotspots)&&block.speed.hotspots.length>0;
        const serviceUnavailable=!liveCurrent||block?.dataState==='cached'||block?.dataState==='unavailable'||['error','reauth_required'].includes(block?.status)||!(labourHasNumber||speedHasNumber||hasHotspots);
        if(serviceUnavailable){
          merged.labour=null;merged.speed=null;merged.peakSales=[];merged.staffingSignals=[];merged.serviceDataState='unavailable';
          merged.serviceUnavailableReason=!liveCurrent?'Aucune collecte Clearview confirmée aujourd’hui dans les 75 dernières minutes; aucune valeur antérieure n’est utilisée pour les temps de service.':'Temps de service non fournis pour la journée affichée; aucune valeur de la journée précédente n’est utilisée.';
        }else merged.serviceDataState='current';
        if(comparison){merged.sameDayLastYear=comparison;hasYearAgo=true;yearAgoDate=comparison.date;}else delete merged.sameDayLastYear;
        // Ces propriétés appartiennent à l'ancienne logique de repli; elles ne doivent plus réapparaître.
        delete merged.referenceFields;delete merged.referenceAsOf;delete merged.referenceLabel;
        data[key]=merged;
      }else data[key]=block;
      if(block?.dataState==='cached')isSnapshot=true;
      continue;
    }
    const state=block?.status||briefing?.[key]?.status||briefing?.sources?.find(s=>s.id===key)?.status||'stale';
    data[key]={...DAILY_DASHBOARD_SNAPSHOT[key],status:state,dataState:'cached',lastSuccessfulCollection:DAILY_DASHBOARD_SNAPSHOT.verifiedOn};
    if(key==='clearview'){
      data[key].labour=null;data[key].speed=null;data[key].peakSales=[];data[key].staffingSignals=[];data[key].serviceDataState='unavailable';
      data[key].clearviewFreshness='stale';data[key].clearviewReadAt=data[key].lastSuccessfulCollection;
      data[key].serviceUnavailableReason='Temps de service non fournis pour la journée affichée; aucune valeur de la journée précédente n’est utilisée.';
    }
    isSnapshot=true;
  }
  if(isSnapshot&&!live?.priorities?.length){data.priorities=DAILY_DASHBOARD_SNAPSHOT.priorities;data.executiveSummary=DAILY_DASHBOARD_SNAPSHOT.executiveSummary;data.asOf=DAILY_DASHBOARD_SNAPSHOT.asOf;}
  return {data,isSnapshot,hasYearAgo,yearAgoDate};
}
function dashboardTone(level){return ['critical','high','medium','low'].includes(level)?level:'medium';}
function dashboardDelta(delta){if(delta===null||delta===undefined||delta===''||!Number.isFinite(Number(delta)))return '';const n=Number(delta);return '<span class="dash-delta '+(n<0?'down':'up')+'">'+(n>0?'+':'')+briefingNumber(n,1)+' pt</span>';}
let dailyDashboardInsights={};
let dailyDashboardInsightCounter=0;
let dailyDashboardReturnFocus=null;

function dashboardInsightTone(item){
  if(item?.tone)return item.tone;
  if(item?.caution||Number(item?.delta)<0||['critical','high','medium'].includes(item?.level))return 'negative';
  if(Number(item?.delta)>0||item?.level==='low')return 'positive';
  return 'neutral';
}
function dashboardDefaultExplanation(item,tone){
  if(tone==='positive')return 'Le résultat est favorable par rapport à la comparaison affichée. L’indicateur confirme une performance positive, mais ne suffit pas à lui seul pour identifier la cause.';
  if(tone==='negative')return 'Le résultat signale un écart à comprendre. Il faut vérifier le volume, le positionnement, la formation, les ressources et les conditions du quart avant d’attribuer une cause.';
  return 'Cette donnée décrit la situation observée. Sans objectif officiel ou comparaison équivalente, elle ne doit pas être classée automatiquement comme bonne ou mauvaise.';
}
function dashboardDefaultSolution(tone){
  if(tone==='positive')return 'Repérer les pratiques et les quarts associés au bon résultat, puis les maintenir et les transmettre à l’équipe.';
  if(tone==='negative')return 'Confirmer d’abord la cause fondamentale, choisir une action mesurable, puis comparer le même indicateur après correction.';
  return 'Comparer cette donnée avec la prévision, l’historique et les objectifs officiels avant de décider d’une modification.';
}
function dashboardRegisterInsight(item){
  const tone=dashboardInsightTone(item),id='dash-insight-'+(++dailyDashboardInsightCounter);
  dailyDashboardInsights[id]={
    title:item?.title||item?.label||'Information du tableau de bord',tone,
    explanation:item?.explanation||item?.detail||item?.evidence||dashboardDefaultExplanation(item,tone),
    solution:item?.solution||item?.action||dashboardDefaultSolution(tone),
    evidence:item?.evidence||'',measure:item?.measure||'',caution:item?.caution||'',details:Array.isArray(item?.details)?item.details:[]
  };
  return id;
}
function dashboardInsightAttrs(item){
  const id=dashboardRegisterInsight(item);
  return ' role="button" tabindex="0" aria-haspopup="dialog" data-insight-id="'+id+'" onclick="openDashboardInsight(\''+id+'\',this)" onkeydown="dashboardInsightKey(event,\''+id+'\')"';
}
function dashboardInsightLabel(tone){return tone==='positive'?'Point fort':tone==='negative'?'À améliorer':'À comprendre';}
function dashboardInsightBadge(item){const tone=dashboardInsightTone(item);return '<span class="dash-insight-badge '+tone+'">'+dashboardInsightLabel(tone)+' · ouvrir</span>';}
function dashboardInsightKey(event,id){if(event.key==='Enter'||event.key===' '){event.preventDefault();openDashboardInsight(id,event.currentTarget);}}
function openDashboardInsight(id,trigger){
  const item=dailyDashboardInsights[id],modal=document.getElementById('dashboardInsightModal');if(!item||!modal)return;
  dailyDashboardReturnFocus=trigger||document.activeElement;
  const positive=item.tone==='positive',negative=item.tone==='negative';
  modal.querySelector('[data-insight-status]').textContent=dashboardInsightLabel(item.tone);
  modal.querySelector('[data-insight-status]').className='dash-insight-status '+item.tone;
  modal.querySelector('[data-insight-title]').textContent=item.title;
  modal.querySelector('[data-insight-explanation-title]').textContent=positive?'Pourquoi ce point est positif':negative?'Pourquoi ce point demande ton attention':'Comment lire cette information';
  modal.querySelector('[data-insight-explanation]').textContent=item.explanation;
  modal.querySelector('[data-insight-solution-title]').textContent=positive?'Comment conserver ce résultat':negative?'Solution pour réduire le problème':'Prochaine vérification utile';
  modal.querySelector('[data-insight-solution]').textContent=item.solution;
  const details=modal.querySelector('[data-insight-details]');
  if(details){
    details.hidden=!item.details.length;
    details.innerHTML=item.details.length?'<ul>'+item.details.map(detail=>'<li><strong>'+esc(detail.title||'Détail')+'</strong><span>'+esc(detail.body||detail.detail||'')+'</span></li>').join('')+'</ul>':'';
  }
  const follow=modal.querySelector('[data-insight-follow]');
  follow.hidden=!item.measure;follow.textContent=item.measure?'Mesure de suivi : '+item.measure:'';
  modal.hidden=false;document.body.classList.add('dash-modal-open');
  const box=modal.querySelector('section');
  const narrow=window.innerWidth<700;
  // Keep the dialog in the visible viewport instead of anchoring its top to the
  // clicked card (which could place it below the point of interaction on iPad).
  modal.style.alignItems=narrow?'flex-end':'center';
  modal.style.padding=narrow?'0':'22px';
  box.style.top='';
  box.style.transform='';
  requestAnimationFrame(()=>modal.classList.add('open'));
  modal.querySelector('.dash-insight-close').focus();
}
function closeDashboardInsight(){
  const modal=document.getElementById('dashboardInsightModal');if(!modal||modal.hidden)return;
  modal.classList.remove('open');modal.hidden=true;document.body.classList.remove('dash-modal-open');
  if(dailyDashboardReturnFocus?.focus)dailyDashboardReturnFocus.focus();dailyDashboardReturnFocus=null;
}
function dashboardInsightModalHTML(){
  return '<div id="dashboardInsightModal" class="dash-insight-modal" hidden onclick="if(event.target===this)closeDashboardInsight()"><section role="dialog" aria-modal="true" aria-labelledby="dashboardInsightTitle"><button type="button" class="dash-insight-close" onclick="closeDashboardInsight()" aria-label="Fermer">×</button><span data-insight-status class="dash-insight-status"></span><h5 id="dashboardInsightTitle" data-insight-title></h5><div class="dash-insight-block"><h6 data-insight-explanation-title></h6><p data-insight-explanation></p></div><div class="dash-insight-details" data-insight-details hidden></div><div class="dash-insight-block solution"><h6 data-insight-solution-title></h6><p data-insight-solution></p></div><p class="dash-insight-follow" data-insight-follow hidden></p><small>Cause à confirmer sur le quart : formation, ressources, positionnement et volume. Vérifie le résultat après l’action.</small></section></div>';
}
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeDashboardInsight();});

function dashboardMetric(metric){
  return '<article class="dash-metric dash-clickable '+(metric.caution?'caution':'')+'"'+dashboardInsightAttrs({...metric,title:metric.label})+'><span>'+esc(metric.label||'Indicateur')+'</span><strong>'+briefingNumber(metric.value,Number(metric.value)%1?1:0)+esc(metric.unit||'')+'</strong><div>'+dashboardDelta(metric.delta)+'<small>'+esc(metric.comparison||'')+'</small></div>'+dashboardInsightBadge(metric)+'</article>';
}
function dashboardWeekly(weekly){
  if(!weekly?.length)return '<p class="dash-empty">Tendance non disponible.</p>';
  return '<div class="dash-weekly" aria-label="Tendance hebdomadaire">'+weekly.map(w=>{const valid=w.value!==null&&w.value!==undefined&&w.value!==''&&Number.isFinite(Number(w.value))&&!(Number(w.value)===0&&Number(w.count)>0&&!w.zeroVerified);return '<div class="dash-week"><div><span>'+esc(w.label||'Semaine')+'</span><strong>'+(valid?briefingNumber(w.value,1)+' %':'Donnée indisponible')+'</strong></div><div class="dash-week-chart" role="img" aria-label="'+esc((w.label||'Semaine')+': '+(valid?briefingNumber(w.value,1)+' pour cent':'donnée indisponible'))+'">'+(valid?'<i style="height:'+Math.max(3,Math.min(100,Number(w.value)))+'%"></i>':'')+'</div><small>'+briefingNumber(w.count)+' réponse'+(Number(w.count)>1?'s':'')+'</small></div>';}).join('')+'</div>';
}
function dashboardComplaint(c){
  return '<article class="dash-complaint '+dashboardTone(c.level)+'"><div><span class="dash-date">'+esc(briefingDate(c.date))+'</span><strong>'+esc(c.title||'Signalement client')+'</strong></div><p>'+esc(c.detail||'')+'</p></article>';
}
function dashboardPriorityDetails(p,index){
  return {title:String(index+1).padStart(2,'0')+' · '+(p.title||'Priorité'),body:'Où : '+(p.evidence||'Emplacement ou signal non précisé.')+'\nPourquoi : ce signal est classé '+(p.level||'à surveiller')+'; la donnée indique un écart, mais la cause doit être confirmée sur le quart.\nAction : '+(p.action||'Action à préciser.')+'\nSuivi : '+(p.measure||'Mesure de suivi à préciser.')};
}
function dashboardPriority(p,index){
  return '<article class="dash-priority dash-clickable '+dashboardTone(p.level)+'"'+dashboardInsightAttrs({...p,tone:'negative',explanation:'Où : '+(p.evidence||'Constat indisponible.')+' Pourquoi : le niveau '+(p.level||'à surveiller')+' impose une vérification; la cause reste à confirmer sur le quart.',solution:p.action,details:[dashboardPriorityDetails(p,index)]})+'><span class="dash-priority-number">'+String(index+1).padStart(2,'0')+'</span><div><h6>'+esc(p.title||'Priorité')+'</h6><p><b>Constat.</b> '+esc(p.evidence||'')+'</p><p><b>Action.</b> '+esc(p.action||'')+'</p><small><b>Suivi.</b> '+esc(p.measure||'')+'</small>'+dashboardInsightBadge({tone:'negative'})+'</div></article>';
}
function dashboardTheme(t){return '<div class="dash-clickable"'+dashboardInsightAttrs({...t,title:t.label})+'><strong>'+briefingNumber(t.count)+'</strong><span>'+esc(t.label)+'</span>'+dashboardInsightBadge(t)+'</div>';}
function dashboardHotspot(h){return '<div class="dash-clickable"'+dashboardInsightAttrs({...h,title:'Rapidité '+h.time})+'><span>'+esc(h.time)+'</span><strong>'+briefingMoney(h.sales)+'</strong><small>'+briefingNumber(h.overall)+' / '+briefingNumber(h.fcfp)+' / '+briefingNumber(h.rap)+' · '+esc(h.note||'')+'</small>'+dashboardInsightBadge(h)+'</div>';}
function dashboardStaffingSignal(x){return '<div class="dash-clickable"'+dashboardInsightAttrs({...x,title:x.time+' · '+x.title,explanation:x.detail})+'><strong>'+esc(x.time)+' · '+esc(x.title)+'</strong><p>'+esc(x.detail)+'</p>'+dashboardInsightBadge(x)+'</div>';}
function dashboardChannel(channel){
  return '<div class="dash-channel"><div><span>'+esc(channel.label)+'</span><strong>'+briefingNumber(channel.share,1)+' %</strong></div><div class="dash-channel-track"><i style="width:'+Math.max(1,Math.min(100,Number(channel.share)||0))+'%"></i></div><small>'+briefingMoney(channel.amount)+'</small></div>';
}

function dashboardAccordion({code,eyebrow,title,subtitle,stat,status,statusClass='quiet',body,open=false,attention=false}){
  return '<details class="dash-section-card '+(attention?'attention':'')+'" '+(open?'open':'')+'>'+
    '<summary><span class="dash-section-mark" aria-hidden="true">'+esc(code)+'</span><span class="dash-section-copy"><small>'+esc(eyebrow)+'</small><strong>'+esc(title)+'</strong><span>'+esc(subtitle||'')+'</span></span>'+
    '<span class="dash-section-summary-stats">'+(stat?'<b>'+esc(stat)+'</b>':'')+(status?'<i class="briefing-status '+statusClass+'">'+esc(status)+'</i>':'')+'</span><span class="dash-section-caret" aria-hidden="true"></span></summary>'+
    '<div class="dash-section-body">'+body+'</div></details>';
}

function briefingFold({code,title,subtitle,status,statusClass='quiet',body,open=false}){
  return '<details class="briefing-fold" '+(open?'open':'')+'><summary><span class="briefing-fold-mark" aria-hidden="true">'+esc(code)+'</span><span class="briefing-fold-copy"><strong>'+esc(title)+'</strong><small>'+esc(subtitle||'')+'</small></span><span class="briefing-status '+statusClass+'">'+esc(status)+'</span><span class="dash-section-caret" aria-hidden="true"></span></summary><div class="briefing-fold-body">'+body+'</div></details>';
}

function dashboardMiniTrend(weekly){
  const points=(weekly||[]).map((w,i)=>({x:i,y:w.value,zeroVerified:w.zeroVerified,count:w.count})).filter(w=>w.y!==null&&w.y!==undefined&&w.y!==''&&Number.isFinite(Number(w.y))&&!(Number(w.y)===0&&Number(w.count)>0&&!w.zeroVerified));
  if(points.length<2)return '';
  const total=Math.max(1,(weekly||[]).length-1),path=points.map((p,i)=>(i?'L':'M')+(2+p.x*92/total).toFixed(1)+' '+(28-Math.max(0,Math.min(100,Number(p.y)))*.24).toFixed(1)).join(' ');
  return '<svg class="dash-spark" viewBox="0 0 98 32" aria-hidden="true" focusable="false"><path d="'+path+'" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}
function dashboardSalesDonut(channels,total){
  const valid=(channels||[]).filter(x=>x.share!==null&&x.share!==undefined&&Number.isFinite(Number(x.share))&&Number(x.share)>0);
  if(!valid.length)return '<p class="dash-empty">Répartition indisponible pour cette collecte.</p>';
  const palette=['var(--rouge)','var(--noir)','var(--sourd)','var(--or)','var(--vert)'];let offset=0;
  const stops=valid.map((x,i)=>{const start=offset;offset+=Number(x.share);return palette[i%palette.length]+' '+start+'% '+Math.min(100,offset)+'%';}).join(',');
  return '<div class="dash-sales-visual"><div class="dash-donut" style="--donut:conic-gradient('+stops+')" role="img" aria-label="Répartition des ventes par point de paiement"><div><small>Ventes produit</small><strong>'+briefingMoney(total)+'</strong></div></div><ul class="dash-legend">'+valid.map((x,i)=>'<li><i style="background:'+palette[i%palette.length]+'"></i><span>'+esc(x.label)+'</span><b>'+briefingNumber(x.share,1)+' %</b><small>'+briefingMoney(x.amount)+'</small></li>').join('')+'</ul></div>';
}
function dashboardRoutine(){
  const today=aujISO(),ready=typeof data!=='undefined'&&data&&Array.isArray(data.taches),tasks=ready&&typeof dayTasks==='function'?dayTasks(today):[],done=tasks.filter(t=>t.fait).length,total=tasks.length,pct=total?Math.round(done/total*100):0,events=ready&&typeof dayEvents==='function'?dayEvents(today):[];
  return '<section class="dash-work-card dash-routine" aria-label="Ma routine"><header><div><span class="briefing-kicker">À faire aujourd’hui</span><h5>Ma routine</h5></div><div class="dash-routine-ring" style="--progress:'+pct+'%" role="img" aria-label="'+done+' tâches terminées sur '+total+'"><span>'+done+'/'+total+'</span></div></header><div class="dash-routine-tasks">'+(tasks.length?tasks.map(dayTaskHTML).join(''):'<p class="dash-empty">Aucune tâche inscrite aujourd’hui.</p>')+'</div><div class="dash-planned"><h6>Prévu aujourd’hui</h6>'+(events.length?events.map(e=>'<button class="daily-event" onclick="'+dayAction('ouvrirForm('+JSON.stringify(e.mod)+','+JSON.stringify(e.id)+')')+'">'+esc(e.t)+'</button>').join(''):'<p class="dash-empty">Aucun rendez-vous ou suivi prévu.</p>')+'</div></section>';
}
function dashboardSameDayLastYearHTML(value){
  if(!value)return '';
  const rows=[],speed=value.speed||{},labour=value.labour||{},sales=value.sales||{},unit=speed.unit||'s';
  if(dashboardHasNumber(speed.overall))rows.push('<div><span>COA</span><strong>'+briefingUnavailable(speed.overall,unit)+'</strong></div>');
  if(dashboardHasNumber(speed.fcfp))rows.push('<div><span>FCFP</span><strong>'+briefingUnavailable(speed.fcfp,unit)+'</strong></div>');
  if(dashboardHasNumber(speed.rap))rows.push('<div><span>RàP</span><strong>'+briefingUnavailable(speed.rap,unit)+'</strong></div>');
  if(dashboardHasNumber(labour.hours))rows.push('<div><span>Heures travaillées</span><strong>'+briefingUnavailable(labour.hours,'h')+'</strong></div>');
  if(dashboardHasNumber(labour.salesPerLabourHour))rows.push('<div><span>VPHT</span><strong>'+briefingUnavailable(labour.salesPerLabourHour,'$')+'</strong></div>');
  if(dashboardHasNumber(labour.transactionsPerLabourHour))rows.push('<div><span>TPEH</span><strong>'+briefingUnavailable(labour.transactionsPerLabourHour)+'</strong></div>');
  if(dashboardHasNumber(sales.product))rows.push('<div><span>Ventes produit</span><strong>'+briefingMoney(sales.product)+'</strong></div>');
  if(!rows.length)return '';
  return '<details class="dash-inline-details dash-year-ago"><summary>Comparer au même jour de l’année précédente</summary><p class="dash-note">Données source du '+esc(briefingWeekdayDate(value.date))+' (même jour de semaine). Cette comparaison est affichée séparément et ne remplace jamais les valeurs du jour.</p><div class="dash-year-grid">'+rows.join('')+'</div></details>';
}
function restaurantDashboardHTML(briefing){
  dailyDashboardInsights={};dailyDashboardInsightCounter=0;
  const wrapped=dashboardPayload(briefing),d=wrapped.data,m=d.medallia||{},c=d.clearview||{},sales=c.sales||{},labour=c.serviceDataState==='current'?(c.labour||{}):{},speed=c.serviceDataState==='current'?(c.speed||{}):{},cash=c.cash||{};
  const clearviewFresh=c.clearviewFreshness==='current',clearviewReadAt=dashboardTimestampLabel(c.clearviewReadAt||c.lastSuccessfulCollection||c.checkedAt),clearviewDate=c.date?briefingDate(c.date):'date inconnue';
  const clearviewMessage=clearviewFresh?'Données du '+clearviewDate+' · lecture confirmée '+(clearviewReadAt?'à '+clearviewReadAt:'')+'.':'Dernière donnée fiable : '+clearviewDate+(clearviewReadAt?' · lue le '+clearviewReadAt:'')+'. '+(c.date===aujISO()?'La prochaine actualisation n’est pas confirmée.':'Les ventes affichées correspondent à cette date, pas à aujourd’hui.')+' Les temps de service du jour restent masqués jusqu’à une lecture confirmée.';
  const clearviewNotice='<div class="dash-source-freshness '+(clearviewFresh?'is-current':'is-stale')+'" role="status"><strong>Clearview GO · '+(clearviewFresh?'lecture confirmée':'actualisation non confirmée')+'</strong><span>'+esc(clearviewMessage)+'</span></div>';
  const priorities=d.priorities||[],attention=priorities.filter(p=>['critical','high'].includes(p.level)).length;
  const satisfaction=(m.metrics||[]).find(x=>x.label==='Satisfaction totale');
  const salesInsight={title:'Ventes produit',tone:'neutral',explanation:sales.explanation||'Les ventes produit décrivent le volume sur la période indiquée. Aucune conclusion sur la performance ne peut être tirée sans prévision et journée comparable.',solution:sales.solution||'Comparer à la prévision, au même jour des semaines précédentes et aux événements locaux avant de modifier la production.'};
  const labourInsight={title:'Productivité VPHT',tone:'neutral',explanation:labour.explanation||(c.serviceDataState==='current'?'Le VPHT relie les ventes aux heures travaillées. Une valeur élevée peut aussi coïncider avec une équipe sous pression.':'Le rapport de la journée affichée ne fournit pas encore les heures travaillées; aucune valeur de la journée précédente n’est utilisée.'),solution:labour.solution||(c.serviceDataState==='current'?'Comparer la productivité avec la rapidité, les plaintes, les tâches et les qualifications avant de modifier les heures.':'Relancer la collecte Clearview de la journée affichée, puis vérifier les heures réellement travaillées avant toute décision de planification.')};
  const priorityDetails=priorities.map((p,i)=>dashboardPriorityDetails(p,i));
  const prioritiesInsight={title:'Priorités actives',tone:attention?'negative':'positive',explanation:attention?(attention===1?'1 priorité élevée ou critique demande une vérification et un suivi.':attention+' priorités élevées ou critiques demandent une vérification et un suivi.'):'Aucune priorité élevée ou critique dans les données disponibles.',solution:attention?'Commencer par le premier axe critique ou élevé, confirmer la cause sur le quart, appliquer l’action indiquée puis mesurer le résultat à la prochaine collecte.':'Poursuivre le suivi des résultats et des pratiques.',details:priorityDetails};
  const medalliaStale=(m.status&&!['ok','none'].includes(m.status))||m.dataState==='cached';
  const staleTag=text=>'<small class="dash-stale-tag">'+esc(text)+'</small>';
  const yearAgo=c.sameDayLastYear,yearAgoSpeed=yearAgo?.speed||{},yearAgoLabour=yearAgo?.labour||{};
  const yearAgoShort=yearAgo?.date?new Date(yearAgo.date+'T12:00:00').toLocaleDateString('fr-CA',{weekday:'short',day:'numeric',month:'short',year:'numeric'}):'';
  const yearAgoRef=(value,unit='')=>c.serviceDataState==='current'||!dashboardHasNumber(value)?'':'<small class="dash-year-ref" title="Même jour de semaine l’an passé : '+esc(briefingWeekdayDate(yearAgo.date))+'">'+esc(yearAgoShort)+' : '+esc(briefingNumber(value,Number(value)%1?2:0)+(unit?' '+unit:''))+'</small>';
  const overview='<div class="dash-overview">'+
    '<article class="dash-clickable"'+dashboardInsightAttrs({...satisfaction,title:'Satisfaction 30 jours'})+'><span>Satisfaction 30 jours</span><strong>'+briefingNumber(satisfaction?.value,1)+' %</strong><small>'+dashboardDelta(satisfaction?.delta)+'</small>'+(medalliaStale?staleTag('Dernière donnée conservée · '+(m.periodLabel||'période non confirmée')+' · Medallia à reconnecter'):'')+dashboardMiniTrend(m.weekly)+dashboardInsightBadge(satisfaction||{})+'</article>'+
    '<article class="dash-clickable"'+dashboardInsightAttrs(salesInsight)+'><span>Ventes produit</span><strong>'+briefingMoney(sales.product)+'</strong><small>'+briefingNumber(sales.guestCount)+' transactions · '+briefingMoney(sales.averageCheck)+' moy.</small>'+(c.date&&c.date!==aujISO()?staleTag('Journée du '+briefingDate(c.date)+', pas aujourd’hui'):'')+dashboardInsightBadge(salesInsight)+'</article>'+
    '<article class="dash-clickable"'+dashboardInsightAttrs(labourInsight)+'><span>Productivité</span><strong>'+(dashboardHasNumber(labour.salesPerLabourHour)?briefingNumber(labour.salesPerLabourHour,2)+' $':'Non collecté')+'</strong><small>'+(dashboardHasNumber(labour.salesPerLabourHour)?'VPHT · '+briefingNumber(labour.hours,2)+' h travaillées':'VPHT du jour non collecté')+'</small>'+yearAgoRef(yearAgoLabour.salesPerLabourHour,'$')+dashboardInsightBadge(labourInsight)+'</article>'+
    '<article class="dash-clickable '+(attention?'attention':'')+'"'+dashboardInsightAttrs(prioritiesInsight)+'><span>Priorités actives</span><strong>'+briefingNumber(attention)+'</strong><small>'+attention+' priorité'+(attention===1?'':'s')+' à examiner</small>'+dashboardInsightBadge(prioritiesInsight)+'</article></div>';
  const priorityList=priorities.slice(0,3).map((p,i)=>'<article class="dash-decision dash-clickable"'+dashboardInsightAttrs({...p,tone:'negative',explanation:'Où : '+(p.evidence||'Constat indisponible.')+' Pourquoi : le niveau '+(p.level||'à surveiller')+' impose une vérification; la cause reste à confirmer sur le quart.',solution:p.action,details:[dashboardPriorityDetails(p,i)]})+'><b>'+String(i+1).padStart(2,'0')+'</b><div><strong>'+esc(p.title)+'</strong><p>'+esc(p.evidence||'Constat indisponible.')+'</p></div>'+dashboardInsightBadge({tone:'negative'})+'</article>').join('');
  const otherPriorities=priorities.length>3?'<details class="dash-inline-details"><summary>'+briefingNumber(priorities.length-3)+' autre'+(priorities.length-3===1?' axe':'s axes')+'</summary><div class="dash-priorities">'+priorities.slice(3).map((p,i)=>dashboardPriority(p,i+3)).join('')+'</div></details>':'';
  const decisions='<section class="dash-work-card dash-decisions"><header><span class="briefing-kicker">Décisions du jour</span><h5>Axes à traiter</h5></header>'+(priorityList||'<p class="dash-empty">Aucun axe signalé dans les données disponibles.</p>')+otherPriorities+'</section>';
  const operations='<section class="dash-work-card dash-operations"><header><span class="briefing-kicker">Clearview GO · '+esc(briefingDate(c.date))+'</span><h5>Répartition des ventes</h5></header>'+dashboardSalesDonut(c.channels,sales.product)+'<details class="dash-inline-details"><summary>Exploitation et ventes · détails</summary><div class="dash-cash-grid"><div><span>Ventes nettes</span><strong>'+briefingMoney(sales.net)+'</strong></div><div><span>Ventes brutes</span><strong>'+briefingMoney(sales.gross)+'</strong></div><div><span>Remboursements</span><strong>'+briefingNumber(sales.refundCount)+'</strong><small>'+briefingMoney(sales.refundAmount)+'</small></div><div><span>Commandes annulées</span><strong>'+briefingNumber(sales.voidCount)+'</strong><small>'+briefingMoney(sales.voidAmount)+'</small></div></div><div class="dash-cash-alert dash-clickable"'+dashboardInsightAttrs({...cash,title:'Écart de dépôt'})+'><span>Écart dépôt</span><strong>'+briefingMoney(cash.variance)+'</strong><small>Attendu '+briefingMoney(cash.expectedDeposit)+' · Réel '+briefingMoney(cash.actualDeposit)+'</small>'+dashboardInsightBadge(cash)+'</div></details></section>';
  const first=speed.hotspots?.[0],serviceNote=c.serviceDataState==='current'?'':'<p class="dash-note">'+esc(c.serviceUnavailableReason||'Temps de service non fournis pour la journée affichée; aucune valeur de la journée précédente n’est utilisée.')+'</p>',yearAgoNote=dashboardSameDayLastYearHTML(c.sameDayLastYear);
  const speedPanel='<section class="dash-work-card dash-operations"><header><span class="briefing-kicker">Exploitation</span><h5>Rapidité de service</h5></header><div class="dash-speed">'+[['COA',speed.overall,'COA (« tous côtés »)',yearAgoSpeed.overall],['FCFP',speed.fcfp,'FCFP',yearAgoSpeed.fcfp],['RàP',speed.rap,'RàP',yearAgoSpeed.rap]].map(([label,value,description,lastYear])=>'<div class="dash-clickable" title="'+esc(description)+'"'+dashboardInsightAttrs({title:'Rapidité · '+label,tone:'neutral',explanation:label==='COA'?'COA signifie « tous côtés » : mesure globale du parcours Clearview. '+(c.serviceDataState==='current'?'Vérifie le volume et les autres étapes avant de conclure.':'La mesure du jour n’est pas disponible; aucune valeur précédente n’est affichée.'):'Valeur Clearview pour la journée affichée. '+(c.serviceDataState==='current'?'Vérifie le volume et les autres étapes avant de conclure.':'La mesure du jour n’est pas disponible; aucune valeur précédente n’est affichée.'),solution:c.serviceDataState==='current'?'Compare plusieurs périodes, puis observe le poste et les ressources au moment de l’écart.':'Relancer la collecte Clearview de la journée affichée, puis observer le parcours réel avant d’agir.'})+'><span>'+label+'</span><strong>'+briefingUnavailable(value,speed.unit||'')+'</strong>'+yearAgoRef(lastYear,yearAgoSpeed.unit||'s')+dashboardInsightBadge({tone:'neutral'})+'</div>').join('')+'</div><div class="dash-planned"><h6>Heures à surveiller</h6>'+serviceNote+(first?dashboardHotspot(first):'<p class="dash-empty">Aucune tranche horaire disponible.</p>')+'<div class="dash-labour"><div><span>Heures travaillées</span><strong>'+briefingUnavailable(labour.hours, 'h')+'</strong>'+yearAgoRef(yearAgoLabour.hours,'h')+'</div><div><span>VPHT</span><strong>'+briefingUnavailable(labour.salesPerLabourHour,'$')+'</strong>'+yearAgoRef(yearAgoLabour.salesPerLabourHour,'$')+'</div><div><span>TPEH</span><strong>'+briefingUnavailable(labour.transactionsPerLabourHour)+'</strong>'+yearAgoRef(yearAgoLabour.transactionsPerLabourHour)+'</div></div>'+(speed.hotspots?.length>1?'<details class="dash-inline-details"><summary>Autres heures à surveiller</summary><div class="dash-hotspots">'+speed.hotspots.slice(1).map(dashboardHotspot).join('')+'</div></details>':'')+yearAgoNote+'</div></section>';
  const medalliaBody=((m.metrics||[]).length?'<div class="dash-metrics">'+m.metrics.map(dashboardMetric).join('')+'</div>':'<p class="dash-empty">Indicateurs indisponibles pour cette collecte.</p>')+'<div class="dash-section-title"><h6>Tendance de satisfaction</h6><span>'+briefingNumber(m.responseCount)+' réponses avec score</span></div>'+dashboardWeekly(m.weekly)+(m.themeSignals?.length?'<div class="dash-themes">'+m.themeSignals.map(dashboardTheme).join('')+'</div>':'')+(m.complaints?.length?'<details class="dash-inline-details"><summary>Signalements · '+m.complaints.length+' dossier'+(m.complaints.length===1?'':'s')+' synthétisé'+(m.complaints.length===1?'':'s')+'</summary><div class="dash-complaints">'+m.complaints.map(dashboardComplaint).join('')+'</div></details>':'');
  return '<section class="restaurant-dashboard" aria-label="Tableau de bord du restaurant 22028"><header class="dash-hero"><div><span class="briefing-kicker">Restaurant 22028</span><h4>La situation en un coup d’œil</h4><p>'+esc(d.executiveSummary||'Aucun résumé disponible pour cette collecte.')+'</p></div><div class="dash-freshness '+(wrapped.isSnapshot?'snapshot':'live')+'"><strong>'+(wrapped.isSnapshot?'Dernier bilan vérifié':(d.provisional||c.serviceDataState==='unavailable'?'Données provisoires':'Bilan reçu'))+'</strong><span>'+(c.date?'Ventes Clearview du '+esc(briefingDate(c.date)):'Données au '+esc(briefingDate(d.asOf||briefing.date)))+'</span>'+(d.asOf&&c.date&&d.asOf!==c.date?'<small>Synthèse rédigée le '+esc(briefingDate(d.asOf))+'.</small>':'')+(c.date&&c.date!==aujISO()?'<small>Ce ne sont pas les ventes d’aujourd’hui.</small>':'')+(c.serviceDataState==='unavailable'?'<small>Les temps de service attendent une collecte du jour.</small>':'')+'</div></header>'+clearviewNotice+overview+'<div class="dash-main-grid">'+decisions+dashboardRoutine()+'</div><div class="dash-main-grid">'+operations+speedPanel+'</div>'+dashboardAccordion({code:'MX',eyebrow:'Medallia',title:'Expérience client',subtitle:(m.periodLabel||'Période indisponible')+' · '+briefingNumber(m.responseCount)+' réponses avec score',stat:briefingNumber(satisfaction?.value,1)+' %',status:briefingStatusLabel(m.status),statusClass:briefingStatusClass(m.status),body:medalliaBody})+dashboardInsightModalHTML()+'</section>';
}

function dailyBriefingHTML(){
  const s=dailyBriefingState;
  if(!s.loaded&&!s.loading)queueMicrotask(()=>loadDailyBriefing());
  if(s.loading&&!s.data)return '<section class="daily-briefing is-loading" aria-busy="true"><div><span class="briefing-kicker">Actualisation horaire</span><h4>Je rassemble tes informations…</h4></div><div class="briefing-skeleton"></div></section>'+restaurantDashboardHTML({date:DAILY_DASHBOARD_SNAPSHOT.asOf});
  if(s.error&&!s.data)return '<section class="daily-briefing briefing-warning" role="status"><div><span class="briefing-kicker">Briefing quotidien</span><h4>Le flux automatique est momentanément indisponible.</h4><p>Le dernier bilan vérifié reste affiché ci-dessous.</p></div><button class="mini-btn" onclick="loadDailyBriefing(true)">Réessayer</button></section>'+restaurantDashboardHTML({date:DAILY_DASHBOARD_SNAPSHOT.asOf});
  const b=s.data||{date:DAILY_DASHBOARD_SNAPSHOT.asOf,generatedAt:'',sources:[]};
  const isToday=b.date===aujISO(),attention=(b.sources||[]).filter(x=>['reauth_required','error'].includes(x.status)),stale=b.feedState==='stale'||(b.generatedAt&&Date.now()-Date.parse(b.generatedAt)>75*60*1000);
  const sourceCards=[
    {key:'mail',title:'Courriels du jour',summary:b.mail?.summary||'',items:b.mail?.items||[],empty:'Aucun courriel professionnel prioritaire depuis le dernier point.'},
    {key:'mchire',title:'McHire · semaine en cours',summary:b.mchire?.summary||'',items:b.mchire?.items||[],empty:'Aucune action de recrutement à signaler.'}
  ];
  const mailFold=sourceCards.map((c,index)=>{const source=b[c.key]||{},unavailable=!['ok','none'].includes(source.status),message=briefingSourceMessage(source,{kind:c.key==='mail'?'mail':'source',items:c.items});return briefingFold({code:index?'MH':'CO',title:c.title,subtitle:unavailable?message:(c.items.length?c.items.length+' dossier'+(c.items.length>1?'s':'')+' à consulter':message||c.empty),status:briefingStatusLabel(source.status),statusClass:briefingStatusClass(source.status),body:briefingSourceFreshness(source)+(unavailable?'<p class="briefing-empty">'+esc(message||'Donnée indisponible pour cette collecte.')+'</p>':briefingList(c.items,message||c.empty))});}).join('');
  const employee=b.employeeOfMonth||{},voteCount=(employee.responses||[]).length;
  const voteFold=briefingFold({code:'EM',title:'Employé du mois',subtitle:employee.summary||employee.note||'Les réponses McD Connect sont relevées automatiquement.',status:['ok','none'].includes(employee.status)?voteCount+' réponse'+(voteCount>1?'s':''):briefingStatusLabel(employee.status),statusClass:briefingStatusClass(employee.status),body:briefingSourceFreshness(employee)+'<p>'+voteCount+' réponse'+(voteCount>1?'s':'')+' retrouvée'+(voteCount>1?'s':'')+'. Les adjectifs restent facultatifs.</p><button class="mini-btn plein" onclick="sousEquipe=\'employeMois\';aller(\'equipe\')">Voir les votes</button>'});
  const sourceDetail=(b.sources||[]).map(x=>'<li><strong>'+esc(x.label||x.id||'Source')+'</strong><span>'+esc(briefingStatusLabel(x.status))+'</span>'+briefingSourceFreshness(x)+'</li>').join('');
  return '<section class="daily-briefing '+(attention.length?'has-attention':'')+'" aria-label="Briefing quotidien">'+
    '<details class="briefing-collection '+(stale||attention.length?'problem':'')+'"><summary>'+(attention.length?attention.length+' source'+(attention.length===1?'':'s')+' à vérifier':stale?'Actualisation en retard':'État de la collecte')+' · '+esc(briefingDateTime(b.generatedAt)||'date indisponible')+'</summary><div><p>'+esc(b.feedMessage||'Dernier bilan reçu. Les détails de chaque source figurent ci-dessous.')+'</p><ul>'+sourceDetail+'</ul><button class="mini-btn" onclick="loadDailyBriefing(true)" '+(s.loading?'disabled':'')+'>'+(s.loading?'Actualisation…':'Revérifier l’affichage')+'</button></div></details>'+
    restaurantDashboardHTML(b)+
    '<section class="briefing-inbox" aria-label="Messages, recrutement et employé du mois"><div class="briefing-inbox-title"><span class="briefing-kicker">À consulter</span><h5>Informations complémentaires</h5><p>Ces blocs restent repliés pour garder la page légère. Ouvre seulement ce dont tu as besoin.</p></div>'+mailFold+voteFold+'</section>'+
    '<footer>Dernière collecte : '+esc(briefingDateTime(b.generatedAt)||briefingDate(b.date))+'. Affichage revérifié automatiquement; la collecte dépend de chaque service source.</footer></section>';
}

htmlJournee=function(){return '<div id="today-dashboard" class="day-dashboard"><header class="day-dashboard-head"><div><span class="briefing-kicker">'+esc(fmtLong(aujISO()))+'</span><h3>Ma journée</h3></div><div class="day-dashboard-actions"><button class="mini-btn" onclick="document.getElementById(\'today-dashboard\').scrollIntoView({behavior:\'smooth\'})">Aujourd’hui</button><button class="mini-btn plein" onclick="addDayItem(aujISO(),false)">+ Ajouter à ma routine</button></div></header>'+dailyBriefingHTML()+'<details class="day-extra"><summary>Autres tâches, suivis et documents</summary>'+dayPanel(aujISO())+'</details>'+upcomingCalendar()+'</div>';};

function dailyElectionSyncHTML(){
  const b=dailyBriefingState.data,e=b?.employeeOfMonth;if(!e)return '';
  const bad=['reauth_required','error'].includes(e.status);
  return '<section class="election-sync '+(bad?'problem':'')+'"><div><span class="briefing-kicker">Synchronisation McD Connect</span><strong>'+(bad?'Connexion à renouveler':esc((e.responses||[]).length+' réponse'+((e.responses||[]).length>1?'s':'')+' relevée'+((e.responses||[]).length>1?'s':'')))+'</strong><p>'+esc(e.summary||'Les choix reçus sont ajoutés sans exiger d’adjectifs.')+'</p></div><button class="mini-btn" onclick="loadDailyBriefing(true)">Vérifier maintenant</button></section>';
}
htmlElection=function(){if(!dailyBriefingState.loaded&&!dailyBriefingState.loading)queueMicrotask(()=>loadDailyBriefing());return dailyElectionSyncHTML()+briefingElectionBase();};

function briefingName(value){return cleanName(String(value||'').replace(/\s+/g,' ').trim());}
function applyDailyElectionResponses(briefing){
  const e=briefing?.employeeOfMonth;if(!e?.month||!Array.isArray(e.responses)||!e.responses.length||typeof data==='undefined'||!data||!Array.isArray(data.elections)||!Array.isArray(data.employeMois))return false;
  if(data.employeMois.some(w=>w.mois===e.month&&['Validé','Affiché'].includes(w.statut)))return false;
  const election=data.elections.find(x=>x.mois===e.month);if(!election)return false;
  let changed=false;
  for(const incoming of e.responses){
    const recipient=election.recipients.find(r=>briefingName(r.nom)===briefingName(incoming.recipient));
    const candidate=election.candidates.find(c=>briefingName(c.nom)===briefingName(incoming.candidate));
    if(!recipient||!candidate)continue;
    const existing=election.responses[recipient.id];
    if(existing&&existing.source!=='McD Connect')continue;
    const adjectives=(incoming.adjectives||[]).map(x=>String(x).trim()).filter(Boolean).slice(0,3);
    const next={candidate:candidate.id,adjectives,date:String(incoming.receivedAt||briefing.date).slice(0,10),source:'McD Connect'};
    if(JSON.stringify(existing)!==JSON.stringify(next)){election.responses[recipient.id]=next;changed=true;}
    if(!election.sent[recipient.id]){election.sent[recipient.id]=incoming.receivedAt||briefing.generatedAt;changed=true;}
  }
  if(changed)election.ts=Date.now();
  return changed;
}

async function loadDailyBriefing(force=false){
  if(dailyBriefingState.loading)return;
  if(dailyBriefingState.loaded&&!force)return;
  dailyBriefingState.loading=true;dailyBriefingState.error='';
  try{
    const response=await fetch('/api/daily-briefing',{cache:'no-store'}),body=await response.json().catch(()=>({}));
    if(!response.ok)throw Error(body.error||'Réessaie dans quelques instants.');
    dailyBriefingState.data=body;dailyBriefingState.loaded=true;
    if(dailyBriefingMerged!==body.generatedAt&&applyDailyElectionResponses(body)){dailyBriefingMerged=body.generatedAt;await sauvegarder();}
  }catch(error){dailyBriefingState.error=error.message||'Réessaie dans quelques instants.';dailyBriefingState.loaded=true;if(dailyBriefingState.data)dailyBriefingState.data={...dailyBriefingState.data,feedState:'stale',feedMessage:dailyBriefingState.error};}
  finally{dailyBriefingState.loading=false;if(typeof charge!=='undefined'&&charge&&typeof vueActive!=='undefined'&&(vueActive==='journee'||(vueActive==='equipe'&&typeof sousEquipe!=='undefined'&&sousEquipe==='employeMois'))&&typeof rendre==='function')rendre();}
}

function refreshDailyBriefingIfStale(){
  const generated=dailyBriefingState.data?.generatedAt?Date.parse(dailyBriefingState.data.generatedAt):0;
  if(!generated||Date.now()-generated>55*60*1000)loadDailyBriefing(true);
}
window.setInterval(refreshDailyBriefingIfStale,5*60*1000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refreshDailyBriefingIfStale();});
