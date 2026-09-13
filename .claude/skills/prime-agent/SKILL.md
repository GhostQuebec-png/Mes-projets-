---
name: prime-agent
description: Installe et utilise Prime Agent (Prime Intellect), un agent IA de codage en ligne de commande concurrent de Claude Code — REPL Python intégré, mode autonome avec gates de validation, sessions persistantes, support MCP et choix de provider/modèle (Anthropic, OpenAI, Amazon Bedrock, etc.). À utiliser quand Romuald demande d'installer "Prime Agent"/"Prime Intellect", de lancer une tâche de codage autonome via cet outil, ou de comparer/faire tourner un agent avec un modèle ou provider différent de celui utilisé actuellement.
---

# Prime Agent

CLI d'agent IA de codage édité par [Prime Intellect](https://www.primeintellect.ai/), installé via un script officiel (binaire natif ou paquet npm selon la plateforme). Fonctionnellement proche de Claude Code : conversation en langage naturel, exécution d'outils, REPL Python, sessions sauvegardées, support MCP, et un mode autonome avec des "gates" (commandes de validation, ex. tests) qui bouclent jusqu'à réussite.

## Installation (une fois par environnement)

```bash
curl -fsSL https://app.primeintellect.ai/prime-agent/install.sh | sh
```

Le script détecte la plateforme, vérifie les checksums SHA-256 des archives, installe un binaire natif si disponible, sinon bascule sur une installation npm globale (nécessite Node.js ≥ 20.6.0). Il configure aussi le PATH si besoin.

Vérifier l'installation :
```bash
prime-agent --version
```

Pour désinstaller/revenir en arrière :
```bash
curl -fsSL https://app.primeintellect.ai/prime-agent/install.sh | sh -s -- --rollback
```

## Configuration requise

Prime Agent a besoin d'une clé API pour le provider de modèle choisi (Anthropic, OpenAI, Amazon Bedrock, etc.) :

```bash
prime-agent --provider anthropic --api-key "$ANTHROPIC_API_KEY" "ta tâche"
```

Lister les modèles/providers disponibles :
```bash
prime-agent model list
prime-agent model list claude   # filtre par recherche
```

## Usage de base

```bash
# Mode conversationnel interactif
prime-agent

# Une seule requête, réponse imprimée puis sortie (utile en script/CI)
prime-agent -p "Corrige le bug dans scraper/main.py"

# Passer des fichiers en contexte
prime-agent @scraper/main.py "Explique cette fonction"

# Choisir un répertoire de travail précis
prime-agent --cwd /home/user/Mes-projets-/mcdo "Résume ce dossier"
```

## Mode autonome (avec validation)

Boucle jusqu'à ce que la ou les commandes de "gate" passent, ou jusqu'à une limite :

```bash
prime-agent --autonomous \
  --autonomous-gate "npm test" \
  --autonomous-max-turns 20 \
  "Corrige les tests qui échouent"
```

Options utiles : `--autonomous-gate-retries`, `--autonomous-gate-timeout-ms`, `--autonomous-max-continuations`, `--autonomous-max-tokens`, `--autonomous-timeout-ms`.

## Sessions

```bash
prime-agent -c                # reprend la dernière session
prime-agent -r                # ouvre la liste des sessions sauvegardées
prime-agent -r <id|path>      # reprend une session précise
prime-agent list              # liste les agents/sessions
prime-agent session           # gère les sessions sauvegardées
```

## MCP et extensions

```bash
prime-agent mcp add     # ajouter un serveur MCP (HTTP ou stdio)
prime-agent mcp list    # lister les serveurs MCP configurés

prime-agent package install <nom>   # installer un paquet de capacités (extensions/skills/prompts/thèmes)
prime-agent package list
```

## Aide complète

```bash
prime-agent --help
prime-agent help <commande>   # détail d'une sous-commande (agents, mcp, package, model, session, config, schedule, doctor...)
```

## À garder en tête

- C'est un outil tiers indépendant de Claude Code : ne pas confondre son concept de "skill" (`--skill <path>`, packages) avec les skills de ce dépôt (`.claude/skills/`) — ce sont deux systèmes distincts.
- Le script d'installation télécharge et exécute du code (`curl | sh`) : c'est le mode d'installation officiel documenté par Prime Intellect, mais reste sensible à vérifier si la source venait à changer.
- Fonctionne aussi bien en environnement sandbox/CI (`-p`, `--mode json`, `--offline` pour désactiver les opérations réseau au démarrage).
