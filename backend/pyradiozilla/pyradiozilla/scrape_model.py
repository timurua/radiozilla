class HttpRequest:
    def __init__(self, url: str, headers: dict = None, params: dict = None):
        self.url = url
        self.headers = headers
        self.params = params

    def __repr__(self):
        return f"<HttpRequest(url={self.url}, headers={self.headers}, params={self.params})>"

    def __str__(self):
        return f"HttpRequest(url={self.url}, headers={self.headers}, params={self.params})"

class DownloadedPage:
    def __init__(self, url: str, content: str = None, status_code: int = None, request_timestamp: str = None):
        self.url = url
        self.content = content
        self.status_code = status_code
        self.request_timestamp = request_timestamp

    def download(self):
        try:
            response = requests.get(self.url)
            self.content = response.text
            self.status_code = response.status_code
        except requests.RequestException as e:
            print(f"An error occurred: {e}")
            self.content = None
            self.status_code = None

    def is_successful(self):
        return self.status_code == 200

    def __repr__(self):
        return f"<DownloadedPage(url={self.url}, status_code={self.status_code})>"