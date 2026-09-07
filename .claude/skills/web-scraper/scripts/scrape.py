#!/usr/bin/env python3
"""Scraper générique en ligne de commande, basé sur Scrapling.

Exemples:
    python3 scrape.py https://exemple.com
    python3 scrape.py https://exemple.com --selector ".event-card" --text
    python3 scrape.py https://exemple.com --selector "a::attr(href)" --links
    python3 scrape.py https://exemple.com --stealth --json out.json
"""
import argparse
import json
import sys

from scrapling.fetchers import Fetcher, StealthyFetcher


def fetch_page(url: str, stealth: bool, headless: bool, impersonate: str):
    if stealth:
        return StealthyFetcher.fetch(url, headless=headless)
    return Fetcher.get(url, impersonate=impersonate)


def extract(page, selector: str | None):
    if not selector:
        return [page]
    return page.css(selector)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("url", help="URL du site à scraper")
    parser.add_argument("--selector", "-s", help="Sélecteur CSS à appliquer (ex: '.event-card', 'a::attr(href)')")
    parser.add_argument("--text", action="store_true", help="Affiche le texte des éléments trouvés")
    parser.add_argument("--links", action="store_true", help="Affiche tous les liens (href) de la page")
    parser.add_argument("--stealth", action="store_true", help="Utilise un vrai navigateur (JS, anti-bot) au lieu d'une requête HTTP simple")
    parser.add_argument("--no-headless", action="store_true", help="Affiche le navigateur (utile pour déboguer avec --stealth)")
    parser.add_argument(
        "--impersonate",
        default="chrome116",
        help=(
            "Empreinte TLS/navigateur à imiter pour les requêtes non-stealth (défaut: chrome116). "
            "Certains proxys réseau coupent les connexions des empreintes Chrome récentes "
            "(échange de clé post-quantique) ; une empreinte plus ancienne contourne le problème."
        ),
    )
    parser.add_argument("--json", metavar="FICHIER", help="Écrit le résultat en JSON dans ce fichier")
    args = parser.parse_args()

    try:
        page = fetch_page(args.url, stealth=args.stealth, headless=not args.no_headless, impersonate=args.impersonate)
    except Exception as exc:
        print(f"Erreur lors du chargement de {args.url}: {exc}", file=sys.stderr)
        sys.exit(1)

    if args.links:
        results = page.css("a::attr(href)")
    else:
        results = extract(page, args.selector)

    output = []
    for item in results:
        if isinstance(item, str):
            output.append(item)
        elif args.text:
            output.append(item.text)
        else:
            output.append(str(item.html_content) if hasattr(item, "html_content") else str(item))

    if args.json:
        with open(args.json, "w", encoding="utf-8") as f:
            json.dump(output, f, ensure_ascii=False, indent=2)
        print(f"{len(output)} résultat(s) écrit(s) dans {args.json}")
    else:
        for r in output:
            print(r)
        print(f"\n{len(output)} résultat(s) trouvé(s)", file=sys.stderr)


if __name__ == "__main__":
    main()
