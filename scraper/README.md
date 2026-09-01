# scraper

Simple command-line web scraper.

## Install

```
pip install -r scraper/requirements.txt
```

## Usage

```
python3 scraper/scrape.py <url> [--stealth] [--selector CSS_SELECTOR] [--text] [--timeout SECONDS]
```

- `--stealth`: send randomized, browser-like headers, add human-like delays
  between requests, and retry with backoff on 403/429/5xx responses.
- `--selector`: CSS selector for the elements to extract. Defaults to the
  whole page.
- `--text`: print the text content of matches instead of raw HTML.

### Example

```
python3 scraper/scrape.py https://example.com --stealth --selector "h1" --text
```
