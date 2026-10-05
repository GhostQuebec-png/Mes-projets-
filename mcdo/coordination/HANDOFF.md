# Passation ChatGPT ↔ Claude

## Dernière passation

Date : 2026-10-05
Auteur : Claude (Claude Code, session cloud)
Branche : `claude/relaxed-tesla-p190b6` (dépôt `Mes-projets-`)
Projet : St-Jovite · Gestion — Site

### Objectif
Identifier avec certitude la source actuellement publiée du site et la consigner, sans modifier de code.

### Accès confirmés
- Lecture et écriture (push) sur `GhostQuebec-png/Mes-projets-`.
- Lecture et écriture (push) aussi sur `GhostQuebec-png/plan-stjovite`, `on-embauche-21-22-23-aout-2026` et `docs`.
- Création de branches et de commits : OK. Pas de PR créée (non demandée).

### Résultat principal
- Production vérifiée : `GhostQuebec-png/plan-stjovite`, branche `main`, commit `aef30dbc67b3bc105b1562a7ea991893b1f975b5`, servie par GitHub Pages à https://ghostquebec-png.github.io/plan-stjovite/.
- Preuve : empreintes SHA-256 identiques entre la page publique et le dépôt pour `index.html` et `outil_plannings_stjovite.html`. Détails dans `ARCHITECTURE.md`.
- **Réserve** : cette version ne contient ni le libellé « St-Jovite · Gestion », ni Employé du mois / Anniversaires en navigation, ni Clearview GO / collecte des ventes. Il est donc possible qu'une version plus récente existe hors GitHub. À confirmer par Romuald.

### Changements
- Aucun code applicatif modifié (ni dans `Mes-projets-`, ni dans `plan-stjovite`).
- Documentation de coordination mise à jour.

### Fichiers touchés
- `mcdo/coordination/ARCHITECTURE.md` — source publiée, méthode de vérification, structure de l'app, écart constaté, sources écartées.
- `mcdo/coordination/TODO.md` — cases cochées et nouvelles tâches.
- `mcdo/coordination/HANDOFF.md` — cette passation.

### Tests exécutés
- `curl` de https://ghostquebec-png.github.io/plan-stjovite/ (HTTP 200, `last-modified` 2026-09-09 18:21:28 GMT) + `sha256sum` comparé au clone du dépôt : identique.
- Même vérification pour `outil_plannings_stjovite.html` : identique.
- Recherche du libellé « St-Jovite · Gestion » dans les 4 dépôts accessibles et leur historique : aucune occurrence.
- Aucun test fonctionnel du site (connexion par code et Gist non testés : nécessitent les codes et le jeton de Romuald, qui ne doivent pas transiter par le dépôt).

### Points non résolus
1. Confirmer auprès de Romuald l'URL qu'il ouvre réellement pour « St-Jovite · Gestion ». Si c'est une autre adresse (ou un fichier/artefact), récupérer cette version et la verser dans `plan-stjovite` sur une branche avant tout correctif.
2. Les bugs de `BUGS.md` (ventes figées, Clearview GO, connecteurs, courriel) visent des fonctions absentes de la version publiée : ils ne peuvent pas être revalidés sur `aef30db`.
3. Décider si le code doit rester dans `plan-stjovite` (le plus simple : GitHub Pages y est déjà actif) ou migrer dans `Mes-projets-`. Recommandation de Claude : le laisser dans `plan-stjovite` et garder la coordination ici.

### Prochaine action recommandée (pour ChatGPT ou Claude)
1. Obtenir la réponse de Romuald au point 1.
2. Si `plan-stjovite` est bien la production : revalider `BUGS.md` sur l'URL publique, en notant `aef30db` comme version.
3. Pour tout correctif : branche dédiée dans `plan-stjovite` (`claude/<sujet>` ou `agent/<sujet>`), jamais de push direct sur `main` (= mise en ligne immédiate).

---

## Passation précédente

Date : 2026-10-04
Auteur : ChatGPT

- Dépôt `GhostQuebec-png/Mes-projets-` choisi comme espace commun ; structure `mcdo/coordination/` créée ; `AGENTS.md` et `CLAUDE.md` ajoutés.
- Aucun code applicatif modifié.

### Modèle de passation
À chaque nouvelle intervention, remplacer ou compléter la section « Dernière passation » avec :
- auteur ;
- date ;
- objectif ;
- changements ;
- fichiers touchés ;
- tests exécutés ;
- résultats ;
- points non résolus ;
- prochaine action recommandée.
