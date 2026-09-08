# Scraper générique

Script en ligne de commande pour scraper n'importe quel site web, basé sur [Scrapling](https://github.com/D4Vinci/Scrapling).

## Installation

```bash
pip install -r requirements.txt
```

## Utilisation

```bash
# Récupérer tout le HTML d'une page
python3 scrape.py https://exemple.com

# Extraire le texte des éléments correspondant à un sélecteur CSS
python3 scrape.py https://exemple.com --selector ".event-card" --text

# Extraire tous les liens de la page
python3 scrape.py https://exemple.com --links

# Extraire un attribut précis (ex: les href des liens)
python3 scrape.py https://exemple.com --selector "a::attr(href)"

# Site protégé par anti-bot (Cloudflare, etc.) ou nécessitant du JavaScript
python3 scrape.py https://exemple.com --stealth --selector ".prix" --text

# Voir le navigateur pendant le scraping en mode --stealth (débogage)
python3 scrape.py https://exemple.com --stealth --no-headless

# Sauvegarder le résultat en JSON
python3 scrape.py https://exemple.com --selector ".event-card" --text --json resultats.json
```

## Options

| Option | Description |
|---|---|
| `--selector`, `-s` | Sélecteur CSS (supporte la syntaxe `::text` et `::attr(nom)`) |
| `--text` | Retourne le texte des éléments au lieu du HTML |
| `--links` | Raccourci pour extraire tous les `href` de la page |
| `--stealth` | Utilise un vrai navigateur (Playwright/Patchright) — nécessaire pour le JS ou les protections anti-bot |
| `--no-headless` | Affiche le navigateur (avec `--stealth`, utile pour déboguer) |
| `--impersonate` | Empreinte TLS/navigateur imitée en mode non-stealth (défaut: `chrome116`) |
| `--json FICHIER` | Écrit les résultats dans un fichier JSON |

## Notes

- Par défaut, le script fait une requête HTTP simple (rapide, sans JS). Si le site est protégé ou charge son contenu en JavaScript, ajoute `--stealth`.
- Sur Claude Code sur le web, l'accès réseau sortant dépend de la politique réseau de l'environnement : par défaut, seuls certains hôtes (PyPI, npm, GitHub...) sont autorisés. Pour scraper des sites arbitraires depuis une session distante, l'environnement doit être configuré avec un accès réseau plus permissif (voir la doc Claude Code on the web).
- Certains proxys réseau (dont celui de l'environnement Claude Code on the web) interceptent le TLS et ne gèrent pas l'extension d'échange de clé post-quantique envoyée par les Chrome récents (≥119) ni par les navigateurs `--stealth`. Le script utilise par défaut une empreinte `chrome116` en mode non-stealth pour contourner ce problème ; ajuste `--impersonate` si besoin. `--stealth` (vrai navigateur) reste sujet à ce blocage sur un tel réseau, sans contournement connu côté script.
