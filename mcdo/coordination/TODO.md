# TODO partagé

## Priorité 1 — rendre le projet réellement multi-agent
- [x] Identifier la source actuellement publiée : `plan-stjovite@aef30db` sur GitHub Pages (Claude, 2026-10-05).
- [x] Consigner son dépôt, sa branche, son commit et son environnement dans `ARCHITECTURE.md`.
- [ ] Faire confirmer par Romuald que cette URL est bien « St-Jovite · Gestion » (écart de fonctionnalités constaté, voir `ARCHITECTURE.md`).
- [ ] Si une version plus récente existe hors GitHub, la verser dans `plan-stjovite` sur une branche.
- [x] Vérifier que Claude a accès au même dépôt (lecture + push confirmés, 2026-10-05).
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
