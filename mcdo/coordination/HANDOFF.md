# Passation ChatGPT ↔ Claude

## Dernière passation

Date : 2026-10-05
Auteur : ChatGPT
Branche : `agent/export-v87` (dépôt public `Mes-projets-`)
Base : `claude/relaxed-tesla-p190b6`
Projet : St-Jovite · Gestion — Site

### Résultat de la tentative d'export v87
ChatGPT a tenté d'extraire la projection du Site v87 via l'interface de fichiers du projet. L'opération échoue avec le message exact :

> `files.materialize is unavailable for Site projections.`

Les métadonnées restent visibles (Site `st-jovite-gestion`, source version 87, projection revision 84), mais **la source exacte de la v87 n'est pas exportable depuis les outils disponibles dans cette session**.

### Sources récupérées avec succès
ChatGPT a récupéré les paquets suivants depuis la bibliothèque du projet :
- `St-Jovite-Gestion-Operational-v2.3-source.zip` — SHA-256 `079c01406a8fe07a2c6cef7f093f1d8a2c9b95ac3cefbdc8be8a734661e38ca5`
- `St-Jovite-Gestion-correctif-cache-KPI-v74.zip` — SHA-256 `492d67f426084f256f12b2c83d42782e4f8a5a0a3782ca645f338fd33ef57e28`
- `St-Jovite-Gestion-source-publiee-v67.zip` — SHA-256 `b579512fe2148d62decff70f46d4b654b187b89eb92b329ed11f241e18d9ab90`
- `RAPPORT-ST-JOVITE-OPERATIONNEL-v2.3.md` — SHA-256 `89f5c3d808089651be0417b12695836545cf550b78e0a6f7b7dbc0b4abc5d6da`
- `RAPPORT-CLAUDE-v67.md` — SHA-256 `a00f3cf1db107c6b8bd1acb107c6884a708c3335c7bd83bbf304ee4e0e16892e`

Inventaire après extraction :
- v2.3 : 129 fichiers
- v74 : 4 fichiers
- v67 : 124 fichiers

Un scan automatisé des sources texte n'a détecté aucun jeton GitHub, Bearer token, webhook Make/Slack/Discord ou valeur secrète hardcodée correspondant aux motifs recherchés. Les noms de variables sensibles (`BRIEFING_FEED_URL`, `COLLECTOR_TOKEN`, etc.) restent présents comme prévu.

### Blocage de confidentialité GitHub
Avant versement, ChatGPT a vérifié la visibilité des dépôts :
- `GhostQuebec-png/Mes-projets-` : **public**
- `GhostQuebec-png/plan-stjovite` : **public**

Les paquets v2.3/v67 contiennent notamment des horaires, données d'équipe et documents internes. Une branche GitHub publique serait elle aussi publiquement accessible.

**Décision de sécurité :** aucun paquet source complet ni donnée RH/interne n'a été versé dans le dépôt public. Aucun secret ni document interne n'a été exposé.

### État de la branche
La branche `agent/export-v87` a bien été créée à partir de `claude/relaxed-tesla-p190b6`.

Elle contient uniquement de la documentation sûre :
- cette passation ;
- une note d'architecture sur le caractère public des dépôts ;
- `mcdo/site/SOURCE-INVENTORY.md` ;
- `mcdo/site/v87/EXPORT-BLOCKED.md`.

### Prochaine action recommandée
Pour permettre la comparaison exacte v2.3 → v87 :
1. obtenir un export manuel de la source v87 depuis l'interface ChatGPT si une option d'export/téléchargement y est disponible ;
2. **ne pas déposer cet export dans un dépôt public** ;
3. utiliser un dépôt GitHub privé dédié, ou rendre explicitement privé un dépôt choisi après décision de Romuald ;
4. y verser v87, v2.3, v74 et v67 après contrôle des secrets et des données sensibles ;
5. Claude pourra alors faire le diff fichier par fichier.

Aucune modification de production n'a été effectuée. Aucun push sur `plan-stjovite/main`.

---

## Passation Claude précédente

Date : 2026-10-05
Auteur : Claude (Claude Code, session cloud)
Branche : `claude/relaxed-tesla-p190b6` (dépôt `Mes-projets-`), avance rapide sur `agent/production-site-v87` puis un commit de Claude par-dessus
Projet : St-Jovite · Gestion — Site

### Objectif
Suivre la passation de ChatGPT : prendre le ChatGPT Site v87 comme production, chercher un moyen sûr de récupérer la source exacte v87, la comparer à v2.3 et aux évolutions v74-v86, sans toucher à la production.

### Décisions de Romuald reçues (2026-10-05)
- Production = ChatGPT Site `st-jovite-gestion`, **source version 87**, lignée « St-Jovite Live Crystal ».
- Référence visuelle et fonctionnelle : « St-Jovite Live v2.3 Crystal Fix ».
- `plan-stjovite@aef30db` n'est **pas** la production et ne doit jamais remplacer la v87.
- Aucune modification de production pour l'instant. Travail sur branche dédiée uniquement.

### Ce que Claude a vérifié
1. **Lecture de `agent/production-site-v87`** : ARCHITECTURE, TODO et HANDOFF de ChatGPT lus et repris tels quels (avance rapide, rien d'écrasé).
2. **Accès direct à la v87** : `GET` sur https://st-jovite-gestion.luce-romuald.chatgpt.site/ → HTTP 401, page « Log in to access · St-Jovite 22028 · Gestion privée » (connexion ChatGPT). Aucun fichier source lisible. Aucune tentative de contournement. Aucune autre requête (en particulier aucun appel à `/api/*`).
3. **Recherche de la lignée dans GitHub** (12 branches de `Mes-projets-` + `plan-stjovite`, `docs`, `on-embauche…`) :
   - v2.3, v67, v74, v75-v86 : **absents de GitHub**.
   - Seule trace : correctifs partiels v58, v60, v61 et instructions de collecte v2 sur la branche non fusionnée `claude/awesome-noether-gwtzj2`, dossier `mcdo/site/`. Détail dans `ARCHITECTURE.md`.
   - Leur base « export v58, commit `3d84383a…` » n'existe dans aucun dépôt accessible.

### Conclusion
- **La comparaison v87 / v2.3 / v74-v86 demandée ne peut pas être faite par Claude aujourd'hui** : aucune de ces sources n'est dans GitHub et la v87 est derrière la connexion ChatGPT.
- **La seule méthode sûre et exacte** : export de la source depuis le projet ChatGPT (où vivent v87, v2.3 et les contrôles), puis versement dans GitHub sur une branche. Le code serveur (Worker, D1, liaisons) n'est de toute façon visible que par cet export, jamais par le navigateur.
- Les correctifs v58-v61 sont des ancêtres partiels. Utiles pour comprendre l'architecture (flux Make `BRIEFING_FEED_URL`, D1 `gestion_documents`, `/api/collector` + `COLLECTOR_TOKEN`), mais **inutilisables comme source de v87**.

### Ce qui reste inconnu (précisément)
- Le contenu exact de la v87 (fichiers, versions, différences avec v2.3).
- Si la v2.3 Crystal Fix a été publiée telle quelle à une version entre v74 et v87, et laquelle.
- Le contenu de chaque étape v75 à v86 (seuls des « contrôles visuels » sont mentionnés).
- L'état actuel du collecteur (agent navigateur + Make) : la dernière info datée (v61, 24 sept.) le donnait en panne pour Clearview. Non revérifié.

### Demande à ChatGPT (prochaine action)
1. Depuis le projet ChatGPT, exporter la **source complète du Site v87** (tous les fichiers du projet, y compris le Worker et les fichiers de configuration). Avant le versement, retirer tout secret, jeton, URL de webhook Make ou cookie (garder les **noms** des variables, pas leurs valeurs).
2. Verser sur une branche dédiée (proposition : `agent/export-v87`, à partir de `claude/relaxed-tesla-p190b6`) :
   - `mcdo/site/v87/` : la source décompressée + un fichier `MANIFEST.txt` (chemin, taille, SHA-256 de chaque fichier, numéro de version source, date d'export) ;
   - `mcdo/site/v2.3/` : le contenu de `St-Jovite-Gestion-Operational-v2.3-source.zip` + `RAPPORT-ST-JOVITE-OPERATIONNEL-v2.3.md` ;
   - si disponibles : le correctif v74 et la base v67, dans `mcdo/site/v74/` et `mcdo/site/v67/`.
3. Si l'export de v87 n'est pas possible depuis ChatGPT, le noter ici avec le message exact obtenu. Romuald pourra alors télécharger la source lui-même depuis l'interface ChatGPT et la déposer sur GitHub.
4. Mettre à jour cette passation, puis Claude fera le diff v2.3 → v87 fichier par fichier et le consignera dans `ARCHITECTURE.md`.

### Changements effectués
- Aucun code de production modifié, aucun push sur `plan-stjovite`, aucune requête autre qu'un `GET` de la page d'accueil du Site.
- Fichiers touchés : `mcdo/coordination/ARCHITECTURE.md` (2 sections ajoutées : accès v87, sources de la lignée dans GitHub), `mcdo/coordination/TODO.md`, `mcdo/coordination/HANDOFF.md`.

### Tests exécutés
- `curl` de la page d'accueil du Site → 401, page de connexion ChatGPT (titre « St-Jovite 22028 · Gestion privée »).
- Inventaire `git ls-tree` de toutes les branches distantes de `Mes-projets-` + recherche de motifs (`zip`, `crystal`, `v2.3`, `operational`, `worker`, `wrangler`).
- Recherche du commit `3d84383a…` dans les 4 dépôts : introuvable.
- Lecture des LISEZMOI v60/v61 et du `worker.js` v61 (routes, liaisons D1, secrets nommés).

---

## Passation précédente

Date : 2026-10-05
Auteur : ChatGPT
Branche : `agent/production-site-v87`

- Production principale identifiée : ChatGPT Site `st-jovite-gestion`, URL https://st-jovite-gestion.luce-romuald.chatgpt.site, statut `active`, accès `custom`, source version 87, projection revision 84.
- `plan-stjovite@aef30db` (GitHub Pages) reclassé en site secondaire / historique.
- Sources retrouvées dans le projet ChatGPT : base serveur v67, correctif cache/KPI v74, interface v2.3 Crystal Fix, paquets v2.3 source + déploiement, rapport v2.3 (Site en v73 au 2026-10-01), contrôles visuels v75, v79, v81, v83, v85, v86.
- Limite : contenu source exact de v87 non lisible avec l'interface de fichiers de ChatGPT.

## Passation antérieure

Date : 2026-10-05
Auteur : Claude

Vérification SHA-256 de `plan-stjovite@aef30db` sur GitHub Pages et signalement de l'écart de fonctionnalités, qui a mené à l'identification du ChatGPT Site v87.

### Modèle de passation
À chaque nouvelle intervention, remplacer ou compléter la section « Dernière passation » avec : auteur, date, objectif, changements, fichiers touchés, tests exécutés, résultats, points non résolus, prochaine action recommandée.
