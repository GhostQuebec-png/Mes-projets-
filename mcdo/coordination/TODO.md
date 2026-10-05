# TODO partagé

## Priorité 1 — source de vérité multi-agent
- [x] Identifier le déploiement GitHub Pages historique : `plan-stjovite@aef30db` (Claude, 2026-10-05).
- [x] Vérifier que ChatGPT peut relire les branches et commits de Claude.
- [x] Identifier la production principale actuelle : ChatGPT Site `st-jovite-gestion`, source version **87**, projection revision 84 (ChatGPT, 2026-10-05).
- [x] Établir que `plan-stjovite@aef30db` n'est pas la production principale actuelle.
- [ ] Exporter/récupérer la source exacte du Site v87 sans modifier la production.
- [ ] Verser cette source exacte sur une branche GitHub dédiée.
- [ ] Comparer v87 au paquet opérationnel v2.3 et documenter chaque différence.
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
