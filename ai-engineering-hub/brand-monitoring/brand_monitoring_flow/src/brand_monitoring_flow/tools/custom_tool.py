from typing import Type
from crewai.tools import BaseTool
from pydantic import BaseModel, Field
import os
import ssl
import time
import requests
from dotenv import load_dotenv

load_dotenv()

ssl._create_default_https_context = ssl._create_unverified_context

class BrightDataWebSearchToolInput(BaseModel):
    """Input schema for BrightDataWebSearchTool."""
    title: str = Field(..., description="Brand name to monitor")

class BrightDataWebSearchTool(BaseTool):
    name: str = "Web Search Tool"
    description: str = "Use this tool to search Google and retrieve the top search results."
    args_schema: Type[BaseModel] = BrightDataWebSearchToolInput

    def _run(self, title: str, total_results: int = 50) -> str:
        
        host = 'brd.superproxy.io'
        port = 33335

        username = os.getenv("BRIGHT_DATA_USERNAME")
        password = os.getenv("BRIGHT_DATA_PASSWORD")
        
        proxy_url = f'http://{username}:{password}@{host}:{port}'

        proxies = {
            'http': proxy_url,
            'https': proxy_url
        }

        query = "+".join(title.split(" "))
        
        url = f"https://www.google.com/search?q=%22{query}%22&tbs=qdr:w&brd_json=1&num={total_results}"
        response = requests.get(url, proxies=proxies, verify=False)

        return response.json()['organic']


def scrape_urls(input_urls: list[str], initial_params: dict, scraping_type: str):

    print(f"Scraping {scraping_type} for {len(input_urls)} urls")
    
    url = "https://api.brightdata.com/datasets/v3/trigger"
    headers = {
        "Authorization": f"Bearer {os.getenv('BRIGHT_DATA_API_KEY')}",
        "Content-Type": "application/json",
    }
    data = [{"url":url} for url in input_urls]

    scraping_response = requests.post(url, headers=headers, params=initial_params, json=data)

    snapshot_id = scraping_response.json()['snapshot_id']

    tacking_url = f"https://api.brightdata.com/datasets/v3/progress/{snapshot_id}"
    status_response  = requests.get(tacking_url, headers=headers)
    
    while status_response.json()['status'] != "ready":
        time.sleep(10)
        status_response  = requests.get(tacking_url, headers=headers)

    print("Scraping completed!")

    output_url = f"https://api.brightdata.com/datasets/v3/snapshot/{snapshot_id}"
    params = {"format": "json"}
    output_response = requests.get(output_url, headers=headers, params=params)

    return output_response.json()