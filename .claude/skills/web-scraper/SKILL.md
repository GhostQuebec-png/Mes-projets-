---
name: web-scraper
description: Scrape any website from the command line — fetch full HTML, extract text/attributes with a CSS selector, pull all links, or get past JavaScript-rendered pages and anti-bot protection (Cloudflare, etc.) with a real stealth browser. Use this whenever the user wants to extract data from a website, monitor a page for changes, pull event dates/prices/listings from a site, or scrape search results — even if they don't say the word "scraper" (e.g. "va chercher les prix sur ce site", "extrais les liens de cette page", "est-ce que ce site a mis à jour ses dates").
---

# Web Scraper

Command-line scraper based on [Scrapling](https://github.com/D4Vinci/Scrapling). Bundled script: `scripts/scrape.py`.

## Setup (once per environment)

```bash
pip install -r scripts/requirements.txt
```

## Usage

```bash
# Full HTML of a page
python3 scripts/scrape.py https://exemple.com

# Text of elements matching a CSS selector
python3 scripts/scrape.py https://exemple.com --selector ".event-card" --text

# All links on the page
python3 scripts/scrape.py https://exemple.com --links

# A specific attribute (e.g. href of links)
python3 scripts/scrape.py https://exemple.com --selector "a::attr(href)"

# Site with JS-rendered content or anti-bot protection (Cloudflare, etc.)
python3 scripts/scrape.py https://exemple.com --stealth --selector ".prix" --text

# Watch the browser while in --stealth mode (debugging)
python3 scripts/scrape.py https://exemple.com --stealth --no-headless

# Save results as JSON
python3 scripts/scrape.py https://exemple.com --selector ".event-card" --text --json resultats.json
```

## Options

| Option | Description |
|---|---|
| `--selector`, `-s` | CSS selector (supports `::text` and `::attr(name)`) |
| `--text` | Return element text instead of HTML |
| `--links` | Shortcut to extract every `href` on the page |
| `--stealth` | Use a real browser (Playwright/Patchright) — needed for JS-rendered content or anti-bot protection |
| `--no-headless` | Show the browser (with `--stealth`, useful for debugging) |
| `--impersonate` | Browser/TLS fingerprint to imitate in non-stealth mode (default: `chrome116`) |
| `--json FICHIER` | Write results to a JSON file |

## Choosing a mode

- Default (no flag): fast plain HTTP request, no JS execution. Use this first — it covers most static sites.
- `--stealth`: only when the plain request comes back empty/blocked, or the content is rendered client-side. Slower (spins up a real browser) but handles JS and most anti-bot walls.

## Known network caveat (Claude Code on the web / similar sandboxed environments)

Some TLS-intercepting proxies reset connections that present the post-quantum key-share extension sent by default by Chrome ≥119 and by `--stealth`'s real browser. If a request fails with a TLS/connection reset:
- In non-stealth mode, it's already mitigated: the script defaults `--impersonate` to `chrome116`, an older fingerprint that omits that extension. Adjust `--impersonate` only if a site needs a different one.
- In `--stealth` mode there is no script-side workaround — the real browser can't be told to drop that TLS extension. If you hit this, fall back to non-stealth (`--impersonate chrome116`) if the site allows it, or tell the user the site requires JS/anti-bot bypass on a network this proxy blocks.

Also, outbound network access depends on the environment's network policy — by default only some hosts (PyPI, npm, GitHub...) are allowed. Scraping arbitrary sites from a remote session may need a more permissive network policy on that environment.

## Output

Without `--json`, results print one per line to stdout, with a result count on stderr. With `--json`, results are written to the given file and a confirmation with the count prints to stdout.
