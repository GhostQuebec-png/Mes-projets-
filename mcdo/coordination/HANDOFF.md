# Passation ChatGPT ↔ Claude

## Dernière passation

Date : 2026-10-05
Auteur : ChatGPT
Branche : `agent/production-site-v87` (dépôt `Mes-projets-`)
Base : `claude/relaxed-tesla-p190b6`
Projet : St-Jovite · Gestion — Site

### Objectif
Vérifier l'hypothèse de Claude selon laquelle une version plus récente de « St-Jovite · Gestion » pouvait exister hors du dépôt `plan-stjovite`, puis identifier la production réelle sans modifier le code en ligne.

### Résultat principal
L'hypothèse est confirmée.

La production principale actuelle est un **ChatGPT Site** :
- slug : `st-jovite-gestion`
- URL : https://st-jovite-gestion.luce-romuald.chatgpt.site
- statut : `active`
- mode d'accès : `custom`
- source version : **87**
- projection revision : **84**

Le GitHub Pages `GhostQuebec-png/plan-stjovite@aef30db` identifié par Claude est bien un déploiement valide et vérifié, mais ce n'est pas la production principale actuelle.

### Sources supplémentaires retrouvées
Dans le projet ChatGPT / bibliothèque :
- source serveur v67 ;
- correctif cache/KPI v74 ;
- interface St-Jovite Live v2.3 Crystal Fix ;
- paquet opérationnel v2.3 source + déploiement ;
- rapport opérationnel v2.3 ;
- contrôles visuels v75, v79, v81, v83, v85, v86.

Le rapport v2.3 indique qu'au 2026-10-01 le ChatGPT Site était en source version 73. Il documente un backend complet avec `/api/data`, `/api/daily-briefing`, `/api/collector`, `/api/weather`, D1 et la logique de fraîcheur KPI issue de v74.

### Limite actuelle
Les métadonnées du Site v87 sont accessibles, mais le contenu source interne exact de v87 n'est pas lisible avec l'interface de fichiers disponible dans cette session.

Conséquence : le paquet v2.3 est une excellente base de comparaison, mais il ne doit pas être déclaré identique à v87 sans export/comparaison.

### Changements effectués
- Aucun code de production modifié.
- Aucun push sur `plan-stjovite/main`.
- Documentation de coordination corrigée sur la branche `agent/production-site-v87`.

### Fichiers mis à jour
- `mcdo/coordination/ARCHITECTURE.md`
- `mcdo/coordination/TODO.md`
- `mcdo/coordination/HANDOFF.md`

### Validation de la collaboration
ChatGPT a pu :
- trouver la branche Claude ;
- comparer la branche Claude à `main` ;
- lire les trois fichiers modifiés par Claude ;
- créer une branche issue directement de celle de Claude.

Le mécanisme GitHub de passation ChatGPT ↔ Claude fonctionne donc.

### Action demandée à Claude
1. Lire la branche `agent/production-site-v87`.
2. Considérer le ChatGPT Site source v87 comme la production principale actuelle.
3. Ne pas déployer `plan-stjovite@aef30db` à la place du Site.
4. Chercher une méthode sûre d'export/récupération de la source exacte v87 sans toucher à la production.
5. Si l'export exact n'est pas disponible, comparer le dernier paquet lisible v2.3 aux éléments v75-v86 et documenter précisément ce qui reste inconnu.
6. Ne revalider les bugs Clearview/Medallia/ventes que sur v87 ou sur un export exact de v87.

### Prochaine décision de Romuald
Une fois l'export v87 obtenu, choisir le dépôt GitHub canonique et y verser la source sur une branche avant toute nouvelle correction.

---

## Passation précédente

Date : 2026-10-05
Auteur : Claude (Claude Code)

Claude a vérifié `plan-stjovite@aef30db` sur GitHub Pages par comparaison SHA-256 et a correctement signalé que cette version ne correspondait pas aux fonctions avancées décrites pour « St-Jovite · Gestion ». Cette réserve a conduit à l'identification du ChatGPT Site v87 ci-dessus.
