# Architecture — état de référence

## Espace commun
Dépôt de coordination : `GhostQuebec-png/Mes-projets-`
Projet : `mcdo/`
Coordination : `mcdo/coordination/`

## Production principale actuelle — vérifiée le 2026-10-05 par ChatGPT

La production principale de « St-Jovite · Gestion » n'est pas le site GitHub Pages identifié précédemment. Elle est hébergée comme **ChatGPT Site**.

| Élément | Valeur |
|---|---|
| Plateforme | ChatGPT Site |
| Slug | `st-jovite-gestion` |
| URL active | https://st-jovite-gestion.luce-romuald.chatgpt.site |
| Statut | `active` |
| Mode d'accès | `custom` |
| Source version | **87** |
| Projection revision | **84** |
| Identifiant projet | `appgprj_6aa2cc6dee7c8191bc549bde4fe4d0fa` |

### Preuve disponible
Le fichier de bibliothèque associé au Site, intitulé `St-Jovite 22028 · Gestion privée.txt`, expose les métadonnées de Site ci-dessus au 2026-10-05.

Les outils de fichiers permettent d'identifier l'état et la version du Site, mais ne renvoient pas actuellement le contenu source interne de la version 87. Il ne faut donc pas prétendre disposer d'une extraction exacte de v87 tant qu'elle n'a pas été exportée.

## Historique technique retrouvé dans le projet

Des sources et paquets plus récents que le dépôt GitHub Pages ont été retrouvés dans le projet ChatGPT :

- base serveur v67 ;
- correctif cache/KPI v74 ;
- interface « St-Jovite Live v2.3 Crystal Fix » ;
- paquet `St-Jovite-Gestion-Operational-v2.3-source.zip` ;
- paquet `St-Jovite-Gestion-Operational-v2.3-deploiement.zip` ;
- rapport `RAPPORT-ST-JOVITE-OPERATIONNEL-v2.3.md` ;
- contrôles visuels ultérieurs identifiés comme v75, v79, v81, v83, v85 et v86 ;
- production actuelle déclarée en source version **87**.

Le rapport opérationnel v2.3 du 2026-10-01 indique qu'à cette date le Site `st-jovite-gestion` était en source version 73 et que le paquet v2.3 était prêt à déployer mais n'était pas présenté comme déjà publié. Il documente notamment les routes `/api/data`, `/api/daily-briefing`, `/api/collector`, `/api/weather`, le binding D1 `DB`, ainsi que la correction de fraîcheur des KPI issue de v74.

### Règle de prudence
Le paquet opérationnel v2.3 est une source utile et testée, mais il ne doit pas être assimilé automatiquement à la source exacte de la production v87. Toute différence entre v2.3 et v87 doit être mesurée après export de la source v87.

## Accès à la v87 depuis Claude — constaté le 2026-10-05

- `GET https://st-jovite-gestion.luce-romuald.chatgpt.site/` → **HTTP 401**, page « Log in to access · St-Jovite 22028 · Gestion privée », bouton « Continue with ChatGPT ». Servi derrière Cloudflare, `cache-control: no-store`.
- Conséquence : le site confirme son existence et son titre, mais **aucun fichier source (HTML, JS, CSS, worker) n'est lisible sans la session ChatGPT de Romuald**. Claude ne doit pas tenter de contourner cette connexion.
- Même connecté, le navigateur ne verrait que le code client. Le code serveur (Worker, D1, secrets, flux Make) n'est jamais exposé publiquement. **Seul un export depuis le projet ChatGPT donne la source exacte et complète de la v87.**

## Sources de la lignée Crystal présentes dans GitHub — constatées par Claude

Les paquets v2.3, v67, v74 et les contrôles v75 à v86 **ne sont pas dans GitHub**. Ils n'existent que dans la bibliothèque du projet ChatGPT. Claude ne peut donc pas les comparer pour l'instant.

La seule trace de la lignée dans GitHub est sur la branche **non fusionnée** `claude/awesome-noether-gwtzj2` de `Mes-projets-`, dossier `mcdo/site/` (24-25 septembre 2026) :

| Dossier | Contenu | Nature |
|---|---|---|
| `correctifs-v58/` | dans l'historique seulement (`4478559`), supprimé ensuite | correctif partiel |
| `correctifs-v60/` | `worker.js`, `daily-briefing.js/.css`, `verify-briefing.mjs`, `verify-collector.mjs`, patch, zip, LISEZMOI | correctif partiel |
| `correctifs-v61/` | idem v60 + delta v60→v61 | correctif partiel |
| `collecteur/` | `instructions-collecte-v2.txt` + zip | consignes de la tâche de collecte |

Ce qu'on en apprend (faits issus de ces fichiers, valables pour v61, **non vérifiés pour v87**) :
- base déclarée : « export v58, commit `3d84383a59df3d71053c2c15b220eaf4ae99891e` ». Ce commit **n'existe dans aucun dépôt accessible** : l'export v58 complet n'a jamais été versé dans GitHub ;
- le Worker lit un flux unique `BRIEFING_FEED_URL` (webhook Make) et stocke dans D1 (`DB`, table `gestion_documents`, lignes `personnel`, `briefing-cache`, `collector-live`) ;
- route `POST /api/collector` protégée par le secret `COLLECTOR_TOKEN` (404 tant que le secret n'existe pas) ;
- la collecte Clearview/Medallia/McHire/McD Connect se fait **hors du code du site** (agent navigateur + scénario Make « Enregistrer le briefing quotidien ») ;
- d'autres fichiers sont cités mais absents : `index.html`, `team.js`, `agenda-upgrades.js`, `package.json`, `verify-today.mjs` et les autres `verify-*.mjs`.

Ordre chronologique de la lignée : v58 → v59 → v60 → v61 (GitHub, partiel) → v67 → v73 (production au 2026-10-01) → v74 → v2.3 Crystal Fix → v75…v86 → **v87 (production)**.
Conclusion : les correctifs v58-v61 sont des **ancêtres partiels**, utiles pour lire l'architecture, mais inutilisables comme source de la v87.

## Déploiement GitHub Pages vérifié par Claude — site secondaire / historique

Claude a correctement vérifié un autre site publié :

| Élément | Valeur |
|---|---|
| Dépôt | `GhostQuebec-png/plan-stjovite` |
| Branche | `main` |
| Commit publié | `aef30dbc67b3bc105b1562a7ea991893b1f975b5` |
| Hébergement | GitHub Pages |
| URL | https://ghostquebec-png.github.io/plan-stjovite/ |
| Dernière mise en ligne constatée | 2026-09-09 |

Claude a comparé les empreintes SHA-256 de `index.html` et `outil_plannings_stjovite.html` entre GitHub et la page servie : elles sont identiques.

Cette vérification reste valide. En revanche, ce site n'est **pas la production principale actuelle de St-Jovite · Gestion**. Il s'agit d'une publication antérieure / secondaire qui ne contient pas plusieurs fonctions de la production moderne.

### Écart fonctionnel constaté sur GitHub Pages
La version `plan-stjovite@aef30db` ne contient pas l'architecture avancée attendue pour la production actuelle, notamment les fonctions de collecte Clearview/Medallia et le pipeline de briefing quotidien documenté dans les sources ultérieures.

## Architecture de collaboration retenue

- `Mes-projets-/mcdo/coordination/` : décisions, TODO, bugs et passations ChatGPT ↔ Claude.
- ChatGPT Site `st-jovite-gestion` : production principale actuelle.
- `plan-stjovite` : dépôt historique / secondaire tant que la source exacte v87 n'y a pas été versée.
- Toute future source GitHub canonique doit être créée à partir d'un **export exact de v87**, pas à partir d'une archive plus ancienne supposée équivalente.

## Flux souhaité
Romuald
→ ChatGPT ou Claude
→ branche GitHub de travail
→ tests et vérification
→ revue par l'autre agent
→ validation de Romuald
→ déploiement sur la production appropriée

## Règles de déploiement
1. Ne jamais remplacer la production ChatGPT Site v87 par `plan-stjovite@aef30db`.
2. Ne jamais considérer v2.3, v74 ou v67 comme identiques à v87 sans comparaison.
3. Ne pas pousser sur `plan-stjovite/main` en pensant que cela met à jour le ChatGPT Site : cela met uniquement à jour GitHub Pages.
4. Travailler sur des branches dédiées et préserver les paramètres d'accès et secrets de production.
5. Aucun secret, cookie, code MFA ou jeton ne doit être versé dans GitHub.
