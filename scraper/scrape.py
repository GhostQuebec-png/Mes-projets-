#!/usr/bin/env python3
"""Command-line web scraper with an optional stealth request mode."""

import argparse
import random
import sys
import time

import requests
from bs4 import BeautifulSoup

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 "
    "(KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
]

STEALTH_MIN_DELAY = 0.8
STEALTH_MAX_DELAY = 2.5
STEALTH_MAX_RETRIES = 3


def build_headers(stealth: bool) -> dict:
    if not stealth:
        return {"User-Agent": "scraper/1.0"}

    return {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,"
        "image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,fr-FR;q=0.8,fr;q=0.7",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "DNT": "1",
    }


def fetch(url: str, stealth: bool, timeout: float) -> requests.Response:
    headers = build_headers(stealth)

    if not stealth:
        response = requests.get(url, headers=headers, timeout=timeout)
        response.raise_for_status()
        return response

    last_error = None
    for attempt in range(1, STEALTH_MAX_RETRIES + 1):
        time.sleep(random.uniform(STEALTH_MIN_DELAY, STEALTH_MAX_DELAY))
        try:
            response = requests.get(
                url, headers=build_headers(stealth), timeout=timeout
            )
            if response.status_code in (403, 429) or response.status_code >= 500:
                last_error = requests.HTTPError(
                    f"HTTP {response.status_code}", response=response
                )
                continue
            response.raise_for_status()
            return response
        except requests.RequestException as exc:
            last_error = exc

        if attempt < STEALTH_MAX_RETRIES:
            time.sleep((2 ** attempt) + random.uniform(0, 1))

    raise last_error


def extract(html: str, selector: str | None, as_text: bool) -> list[str]:
    soup = BeautifulSoup(html, "html.parser")

    if not selector:
        elements = [soup]
    else:
        elements = soup.select(selector)

    if as_text:
        return [el.get_text(strip=True) for el in elements]
    return [str(el) for el in elements]


def parse_args(argv=None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Fetch a URL and optionally extract content by CSS selector."
    )
    parser.add_argument("url", help="URL to scrape")
    parser.add_argument(
        "--stealth",
        action="store_true",
        help="Use randomized browser-like headers, delays, and retries",
    )
    parser.add_argument(
        "--selector",
        help="CSS selector for the elements to extract (default: whole page)",
    )
    parser.add_argument(
        "--text",
        action="store_true",
        help="Output the text content of matches instead of raw HTML",
    )
    parser.add_argument(
        "--timeout",
        type=float,
        default=15.0,
        help="Request timeout in seconds (default: 15)",
    )
    return parser.parse_args(argv)


def main(argv=None) -> int:
    args = parse_args(argv)

    try:
        response = fetch(args.url, args.stealth, args.timeout)
    except requests.RequestException as exc:
        print(f"Error fetching {args.url}: {exc}", file=sys.stderr)
        return 1

    matches = extract(response.text, args.selector, args.text)

    if not matches:
        print(f"No matches for selector: {args.selector}", file=sys.stderr)
        return 1

    for match in matches:
        print(match)

    return 0


if __name__ == "__main__":
    sys.exit(main())
