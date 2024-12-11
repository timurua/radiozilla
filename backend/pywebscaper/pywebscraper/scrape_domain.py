import requests
from urllib.parse import urljoin

class DomainScraper:
    def __init__(self):
        self.session = requests.Session()

    def scrape_domain(self, domain_name):
        urls = {
            "home_page": urljoin(domain_name, "/"),
            "sitemap": urljoin(domain_name, "/sitemap.xml"),
            "robots": urljoin(domain_name, "/robots.txt")
        }

        results = {}
        for key, url in urls.items():
            try:
                response = self.session.get(url)
                response.raise_for_status()
                results[key] = response.text
            except requests.RequestException as e:
                results[key] = f"Error: {e}"

        return results