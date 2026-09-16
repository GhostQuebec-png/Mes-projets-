---
name: playwright-mcp
description: Pilote un vrai navigateur directement via des outils MCP (naviguer, cliquer, remplir un formulaire, prendre un screenshot, lire l'arbre d'accessibilité de la page) sans écrire de script. À utiliser pour des actions interactives ponctuelles sur un site — remplir un formulaire, se connecter, cliquer à travers un parcours, vérifier visuellement une page — plutôt que pour de l'extraction de données en masse (pour ça, voir le skill web-scraper).
---

# Playwright MCP

Serveur MCP officiel de Playwright (`@playwright/mcp`), enregistré au niveau du projet dans `.mcp.json`. Il expose des outils de contrôle de navigateur (navigation, clic, saisie, capture d'écran, lecture de l'arbre d'accessibilité) directement comme des tool calls — pas besoin d'écrire ni d'exécuter un script.

## Installation (déjà faite pour ce dépôt)

Le paquet est déclaré en devDependency dans `package.json` à la racine et installé via :

```bash
npm i
```

Le serveur est déclaré dans `.mcp.json` :

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

Une fois ce fichier présent à la racine du dépôt, Claude Code le détecte automatiquement à l'ouverture d'une session sur ce projet (avec confirmation de sécurité la première fois) et les outils `mcp__playwright__*` deviennent disponibles.

## Quand l'utiliser plutôt que le skill web-scraper

- **playwright-mcp** (ce skill) : action interactive — remplir un formulaire, cliquer dans une interface, se connecter à un site, vérifier le rendu d'une page, naviguer plusieurs étapes.
- **web-scraper** (`.claude/skills/web-scraper`) : extraction de données en masse depuis la ligne de commande (HTML complet, sélecteurs CSS, liens), avec option `--stealth` pour l'anti-bot.

## Notes

- Le premier appel à un outil `mcp__playwright__*` peut prendre quelques secondes (téléchargement/démarrage du navigateur via `npx`).
- L'accès réseau sortant dépend de la politique réseau de l'environnement distant — si un site est bloqué, il faudra une politique plus permissive sur cet environnement.
