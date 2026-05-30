import os
import json
from dotenv import load_dotenv
from scrapegraph_py import Client

load_dotenv()

with Client.from_env() as client:
    response = client.smartscraper(
        website_url="https://quotes.toscrape.com",
        user_prompt="Extract the first 3 quotes with their authors",
    )

print(json.dumps(response, indent=2, ensure_ascii=False))
