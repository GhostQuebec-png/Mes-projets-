# Correctif v61 · St-Jovite Gestion, page « Ma journée »

Base : export v58, commit `3d84383a59df3d71053c2c15b220eaf4ae99891e`.
Tous les tests existants passent, plus le nouveau `verify-collector.mjs` (12 scripts sur 12). La v61 reprend intégralement la v60 (elle-même bâtie sur la v59) et corrige l’affichage de l’an passé dans les cases du jour (dernière section).

## Diagnostic

Ce qui est confirmé par le code et les journaux :

1. **Le site ne collecte rien lui-même.** `worker.js` lit un seul flux (`BRIEFING_FEED_URL`, un webhook Make). Ce webhook ne fait que relire un Data Store. Aucun module Make, aucun fichier du dépôt ne se connecte à Clearview GO, Medallia, McHire ou McD Connect.
2. **Les données sont écrites par un programme extérieur au dépôt.** Le scénario Make « Enregistrer le briefing quotidien » tourne toutes les heures, en démarrage automatique, et réussit à chaque fois. Ce qui l'appelle, et qui se connecte vraiment aux applications McDonald's, ne figure pas dans l'export. D'après les messages affichés (« demandent une authentification », « protocole local non exploitable dans le navigateur distant »), c'est un agent qui navigue dans un navigateur à distance.
3. **La panne se situe dans ce collecteur.** La dernière lecture Clearview réussie date du 23 septembre à 18 h 01 (22:01 UTC), ce qui correspond à l'écriture Make de 22:03 UTC. Toutes les écritures suivantes ont réussi côté Make, mais sans donnée Clearview valide. Gmail fonctionne encore (« À jour »). Les sources qui exigent une connexion web McDonald's ont perdu leur session.
4. **Oui, des erreurs passaient derrière un HTTP 200.** Quand le flux renvoyait toujours le même vieux bilan, le Worker répondait `feedState: "available"` sans vérifier son âge (le README v58 le signalait déjà : « n'applique pas de durée maximale d'âge »). Seul le navigateur rattrapait le problème avec sa règle des 75 minutes.
5. **L'en-tête de la page mélangeait les dates.** Il affichait « Données au 24 septembre » alors que les ventes dataient du 23.
6. **Dates et fuseau : pas de bogue actif.** `aujISO()` en UTC dans `index.html` est remplacée par la version America/Toronto dans `team.js` et `agenda-upgrades.js`. `verify-today.mjs` le confirme.
7. **La règle « temps de service du jour seulement » était déjà respectée à l'affichage.** Elle est maintenant appliquée aussi côté serveur.

## Ce que change le correctif

`worker.js`

- `withFreshness()` : chaque réponse de `/api/daily-briefing` porte maintenant `feedAgeMinutes`, `today` (heure de St-Jovite), `clearviewIsToday`, et pour chaque source `ageMinutes` et `fresh`. Un bilan de plus de 75 minutes passe en `feedState: "stale"`, avec un message clair, même si le flux répond 200.
- `enforceSameDayService()` : temps de service, heures travaillées, VPHT et signaux de main-d'œuvre sont retirés dès que la date Clearview n'est pas celle du jour. La comparaison `sameDayLastYear` est conservée.
- Nouvelle route `POST /api/collector`. C'est la prise où un collecteur branche ses lectures, source par source. Elle est désactivée tant que le secret `COLLECTOR_TOKEN` n'existe pas et exige `Authorization: Bearer <jeton>`. Elle refuse une date absente, un horodatage sans fuseau, une lecture de plus de 6 h ou une lecture vide. Les lectures sont gardées dans D1 (`collector-live`) et superposées au bilan du flux seulement quand elles sont plus récentes.

`daily-briefing.js` / `.css`

- En-tête : « Bilan du 24 septembre · ventes Clearview du 23 septembre » quand les dates diffèrent.
- Carte Satisfaction : mention « Dernière donnée fiable · date » quand Medallia sert une valeur en cache.
- Carte Productivité : « Indisponible · Heures et VPHT du jour non collectés » au lieu de « — $ ».

## Installation

1. Applique `correctif-v61.patch` (ou les fichiers du dossier `fichiers/`) sur la v58, lance `npm run build` puis les 12 `verify-*.mjs`, et publie si tout passe.
2. Ne crée pas le secret `COLLECTOR_TOKEN` pour l'instant (voir la section « Le secret COLLECTOR_TOKEN »). Sans ce secret, la route `/api/collector` répond 404 et le reste du correctif fonctionne.

## Format attendu par `POST /api/collector`

Lecture réussie (Clearview) :

```json
{"source":"clearview","block":{"status":"ok","checkedAt":"2026-09-24T10:20:00-04:00","date":"2026-09-24",
 "sales":{"product":2100.5,"guestCount":180,"averageCheck":11.67},
 "channels":[{"label":"Service au volant","amount":1130,"share":53.8}],
 "speed":{"overall":74,"fcfp":181,"rap":112,"unit":"s","hotspots":[]},
 "labour":{"hours":22.5,"salesPerLabourHour":93.36,"transactionsPerLabourHour":8},
 "sameDayLastYear":{"date":"2025-09-25","speed":{"overall":82,"fcfp":195,"rap":120,"unit":"s"}}}}
```

Échec (session expirée) :

```json
{"source":"medallia","block":{"status":"reauth_required","checkedAt":"2026-09-24T10:20:00-04:00","note":"Session Medallia expirée."}}
```

Sources acceptées : `clearview`, `medallia`, `mchire`, `employeeOfMonth`, `mail`. Statuts d'échec : `reauth_required`, `error`, `not_available`, `partial`, `stale`.

## Ce qui reste à faire hors du code

Le correctif rend la page honnête et prête à recevoir des données fraîches. Il ne peut pas recréer une session McDonald's expirée. Il faut rétablir la collecte en amont. Il me manque pour ça les instructions de la tâche planifiée ChatGPT (ou de l'agent) qui appelle « Enregistrer le briefing quotidien ».

## Ajouts de la v60 (par-dessus la v59)

`daily-briefing.js`, `daily-briefing.css` et `verify-briefing.mjs` seulement. `worker.js` et `verify-collector.mjs` sont identiques à la v59.

- **Comparaison annuelle = même jour de semaine, 364 jours plus tôt.** Le jeudi 24 septembre 2026 se compare au jeudi 25 septembre 2025, jamais au 24 septembre 2025, qui tombait un mercredi. Une comparaison envoyée avec une autre date est refusée à l'affichage. L'exemple Clearview ci-dessus est corrigé en conséquence (`2025-09-25`).
- **Cases du jour indisponibles** (COA, FCFP, RàP, heures travaillées, VPHT, TPEH, carte Productivité) : elles gardent « Donnée indisponible » et affichent en dessous la valeur du même jour de semaine l'an passé, étiquetée « An passé · jeu. 25 sept. 2025 : 84 s ».
- **Carte Ventes produit** : mention « Journée du 23 septembre 2026, pas aujourd'hui » quand Clearview n'est pas du jour.
- **Tests ajoutés** : calcul des 364 jours, refus d'une mauvaise date, aucun temps de la veille affiché comme temps du jour, référence annuelle visible dans les cases.

## Le secret COLLECTOR_TOKEN

La route `POST /api/collector` ne sert à rien tant qu'aucun collecteur ne l'appelle. **Ne crée pas le secret maintenant** : la route reste désactivée (réponse 404), donc rien n'est exposé. On le créera au moment de brancher un collecteur, qui aura besoin de ce même jeton.

## Correction de la v61 (par-dessus la v60)

`daily-briefing.js` et `verify-briefing.mjs` seulement. Les autres fichiers sont identiques à la v60.

- **Problème de la v60.** La référence de l'an passé était calculée à partir de la date du bloc Clearview, mais affichée dans les cases **du jour**. Avec un bloc en cache du mercredi 23 septembre, les cases du jeudi 24 affichaient « An passé · mer. 24 sept. 2025 », donc un mercredi.
- **Correction.** Dans les cases du jour (COA, FCFP, RàP, heures, VPHT, TPEH, carte Productivité), la valeur de l'an passé n'apparaît que si sa date est exactement aujourd'hui moins 364 jours. Quand Clearview est en panne depuis la veille, ces cases n'affichent donc aucune valeur de l'an passé : seule une lecture du jour même apporte la bonne comparaison.
- Le volet « Comparer au même jour de l'année précédente » garde la comparaison propre à la journée affichée, avec son jour de semaine écrit en toutes lettres.
- **Tests.** Bloc de la veille : aucune valeur de l'an passé dans les cases du jour. Bloc du jour lu il y a plus de 75 min : temps du jour masqués, valeur du jour moins 364 jours affichée. Une référence tombant un autre jour de semaine est refusée. Le nouveau test échoue sur la v60 et passe sur la v61.
