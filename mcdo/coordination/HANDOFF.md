# Passation ChatGPT ↔ Claude

## Dernière passation

Date : 2026-10-09
Auteur : Claude
Objectif : intégrer graphify (graphe de connaissances du dépôt) dans Claude Code, validé par Romuald.

### Changements
- Installation projet de graphify 0.9.83 (`graphify install --project --platform claude`).
- Skill `/graphify` dans `.claude/skills/graphify/`, référencé par `.claude/CLAUDE.md`.
- Section `## graphify` à la fin de `CLAUDE.md` : interroger le graphe (`graphify query/path/explain`) avant de fouiller les fichiers.
- Hooks (`.claude/settings.json`) NON versionnés : le système de permissions de Claude a bloqué leur écriture et leur commit. Graphify s'utilise donc à la demande (`/graphify`, `graphify query`), sans incitation automatique.
- `graphify-out/` exclu via `.gitignore` et `.claudeignore` : dépôt public, le graphe peut contenir des données internes ou RH.

### Fichiers touchés
`CLAUDE.md`, `.gitignore`, `.claudeignore`, `.claude/CLAUDE.md`, `.claude/skills/graphify/`, `mcdo/coordination/HANDOFF.md`.

### Tests
- `graphify update .` : 434 nœuds, 436 arêtes, 36 communautés, 0 jeton LLM.
- `graphify query "planning positionnement"` : sous-graphe retourné correctement.

### Points non résolus
- graphify n'est pas préinstallé dans les sessions cloud : lancer `uv tool install graphifyy==0.9.83`, puis `graphify update .`
- Les hooks automatiques ne sont pas en place (bloqués par les permissions). Pour les activer, Romuald doit ajouter lui-même un hook `SessionStart` d'installation et les hooks `PreToolUse` (`graphify hook-guard`) dans `.claude/settings.json`.
- Le graphe n'est pas versionné : en début de session, lancer `graphify update .` (AST seul, sans coût) pour le reconstruire.
- L'extraction sémantique des documents (`/graphify .`) n'a pas été lancée (consomme le quota du modèle).
- Le code du site est dans le dépôt privé `st-jovite-gestion-private` : graphify n'y est pas encore installé.

### Prochaine action recommandée
Installer graphify de la même façon dans le dépôt privé.

## Passation précédente

Date : 2026-10-04
Auteur : ChatGPT
Projet : St-Jovite · Gestion — Site

### Travail effectué
- Le dépôt `GhostQuebec-png/Mes-projets-` a été identifié comme espace GitHub commun pertinent.
- Le dépôt contient déjà une configuration `.claude/skills` et un dossier `mcdo/`.
- Une structure de coordination commune ChatGPT/Claude a été ajoutée.
- Aucun code applicatif existant n'a été modifié.

### Fichiers ajoutés
- `AGENTS.md`
- `CLAUDE.md`
- `mcdo/coordination/PROJECT.md`
- `mcdo/coordination/ARCHITECTURE.md`
- `mcdo/coordination/DECISIONS.md`
- `mcdo/coordination/BUGS.md`
- `mcdo/coordination/TODO.md`
- `mcdo/coordination/HANDOFF.md`

### Prochaine action attendue
Claude doit :
1. lire `AGENTS.md` et `CLAUDE.md` ;
2. lire tout `mcdo/coordination/` ;
3. confirmer qu'il voit le dépôt et peut travailler dessus ;
4. ne modifier aucun code de production avant identification de la source canonique actuellement publiée.

### Modèle de passation
À chaque nouvelle intervention, remplacer ou compléter cette section avec :
- auteur ;
- date ;
- objectif ;
- changements ;
- fichiers touchés ;
- tests exécutés ;
- résultats ;
- points non résolus ;
- prochaine action recommandée.
