# TODO partagé

## Priorité 1 — rendre le projet réellement multi-agent
- [ ] Identifier la source canonique actuellement publiée de « St-Jovite · Gestion ».
- [ ] Consigner son dépôt, sa branche, son commit et son environnement dans `ARCHITECTURE.md`.
- [ ] Vérifier que Claude a accès au même dépôt.
- [ ] Vérifier que ChatGPT peut relire les commits et pull requests de Claude.
- [ ] Adopter une convention de branches pour éviter les modifications concurrentes.

## Priorité 2 — état du site
- [ ] Revalider les problèmes historiques listés dans `BUGS.md`.
- [ ] Classer chaque problème : confirmé, résolu, non reproductible, ou information manquante.
- [ ] Créer une tâche distincte pour chaque bug confirmé.

## Convention proposée
Branches Claude : `claude/<sujet>`
Branches ChatGPT/agent : `agent/<sujet>`
Correctifs : `fix/<sujet>`
Fonctionnalités : `feat/<sujet>`
