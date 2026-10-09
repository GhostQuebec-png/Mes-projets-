# Instructions Claude

Ce dépôt est partagé avec ChatGPT.

Claude doit commencer par lire `AGENTS.md`, puis le dossier de coordination du projet concerné.

Pour le projet McDonald's St-Jovite, lire :
- `mcdo/README.md`
- `mcdo/coordination/PROJECT.md`
- `mcdo/coordination/ARCHITECTURE.md`
- `mcdo/coordination/DECISIONS.md`
- `mcdo/coordination/BUGS.md`
- `mcdo/coordination/TODO.md`
- `mcdo/coordination/HANDOFF.md`

Après toute modification substantielle :
1. décrire ce qui a été changé ;
2. indiquer les fichiers touchés ;
3. noter les tests exécutés et leur résultat ;
4. indiquer les points non résolus ;
5. mettre à jour `mcdo/coordination/HANDOFF.md` si le travail concerne St-Jovite.

Ne jamais placer de secrets ou d'identifiants dans le dépôt.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
