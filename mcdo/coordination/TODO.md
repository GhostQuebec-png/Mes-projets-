# TODO partagé

## Priorité 1 — source de vérité multi-agent
- [x] Identifier le déploiement GitHub Pages historique : `plan-stjovite@aef30db` (Claude, 2026-10-05).
- [x] Vérifier que ChatGPT peut relire les branches et commits de Claude.
- [x] Identifier la production principale actuelle : ChatGPT Site `st-jovite-gestion`, source version **87**, projection revision 84 (ChatGPT, 2026-10-05).
- [x] Établir que `plan-stjovite@aef30db` n'est pas la production principale actuelle.
- [x] Vérifier si Claude peut lire la v87 directement : non, connexion ChatGPT obligatoire (HTTP 401). Seul ChatGPT/Romuald peut exporter (Claude, 2026-10-05).
- [x] Chercher la lignée Crystal dans GitHub : seuls des correctifs partiels v58-v61 existent, sur `claude/awesome-noether-gwtzj2` (Claude, 2026-10-05).
- [ ] **ChatGPT** : exporter depuis le projet ChatGPT la source complète du Site v87 (zip, sans secret), avec sa liste de fichiers et leurs SHA-256.
- [ ] **ChatGPT** : verser aussi dans GitHub `St-Jovite-Gestion-Operational-v2.3-source.zip` et le rapport v2.3 (même branche, sans secret).
- [ ] Verser ces sources sur la branche dédiée, dossier `mcdo/site/v87/` et `mcdo/site/v2.3/`.
- [ ] **Claude** : comparer v87 au paquet v2.3 (diff fichier par fichier) et documenter chaque différence ; rattacher les écarts aux étapes v74-v86 connues.
- [ ] Décider ensuite quel dépôt GitHub devient la source canonique du code.
- [ ] Adopter définitivement la convention de branches pour éviter les modifications concurrentes.

## Priorité 2 — état du site
- [ ] Revalider les problèmes historiques de `BUGS.md` sur la production v87 ou sur son export exact.
- [ ] Classer chaque problème : confirmé, résolu, non reproductible ou information manquante.
- [ ] Créer une tâche distincte pour chaque bug confirmé.
- [ ] Ne jamais présenter une ancienne donnée Clearview/Medallia comme actuelle.

## Sources techniques disponibles pour comparaison
- base serveur v67 ;
- correctif cache/KPI v74 ;
- `St-Jovite-Gestion-Operational-v2.3-source.zip` ;
- `St-Jovite-Gestion-Operational-v2.3-deploiement.zip` ;
- `RAPPORT-ST-JOVITE-OPERATIONNEL-v2.3.md` ;
- contrôles visuels v75, v79, v81, v83, v85, v86 ;
- Site actuel : source version 87.

## Convention proposée
Branches Claude : `claude/<sujet>`
Branches ChatGPT/agent : `agent/<sujet>`
Correctifs : `fix/<sujet>`
Fonctionnalités : `feat/<sujet>`
