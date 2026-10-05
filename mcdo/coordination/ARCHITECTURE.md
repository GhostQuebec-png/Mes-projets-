# Architecture — état de référence

## Espace commun
Dépôt : `GhostQuebec-png/Mes-projets-`
Projet : `mcdo/`
Coordination : `mcdo/coordination/`

## État actuel
Le dépôt contient déjà des documents et outils liés à St-Jovite, mais la source canonique actuellement publiée du site « St-Jovite · Gestion » n'est pas encore identifiée dans ce fichier.

Avant de modifier la production, l'agent doit :
1. identifier le dépôt, la branche ou l'archive correspondant réellement à la version publiée ;
2. relever le commit ou l'identifiant de version ;
3. consigner cette information ici ;
4. seulement ensuite appliquer un correctif.

## Flux souhaité
Romuald
→ ChatGPT ou Claude
→ branche/commit GitHub
→ tests et vérification
→ revue par l'autre agent si nécessaire
→ validation
→ déploiement

## Règle de déploiement
Ne jamais considérer une archive historique, un ancien correctif ou une copie locale comme la production actuelle sans vérification.
