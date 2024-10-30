# github.py

from github import Github
from github.Repository import Repository
from github.PullRequest import PullRequest

class GithubDatasource:
    def __init__(self, access_token: str):
        """
        Initialize the GithubDatasource with an access token.
        
        :param access_token: Personal access token for authenticating with the GitHub API.
        """
        self.access_token = access_token
        self.client = None

    def connect(self):
        """Connect to GitHub using the provided access token."""
        try:
            self.client = Github(self.access_token)
            # Test the connection by getting the authenticated user
            user = self.client.get_user()
            print(f"Connected to GitHub as {user.login}")
        except Exception as e:
            print(f"Failed to connect to GitHub: {e}")

    def read_repositories(self):
        """
        Retrieve and print all repositories accessible by the authenticated user.
        """
        if not self.client:
            print("Not connected to GitHub. Please call connect() first.")
            return
        
        try:
            user = self.client.get_user()
            repos = user.get_repos()
            return [repo.name for repo in repos]
        except Exception as e:
            print(f"Error retrieving repositories: {e}")
            return []

    def read_prs(self, repo_name: str):
        """
        Retrieve and print all open pull requests for a given repository.
        
        :param repo_name: Name of the repository (e.g., 'owner/repository_name').
        """
        if not self.client:
            print("Not connected to GitHub. Please call connect() first.")
            return
        
        try:
            repo: Repository = self.client.get_repo(repo_name)
            pull_requests = repo.get_pulls(state='open')
            return [
                {
                    "number": pr.number,
                    "title": pr.title,
                    "user": pr.user.login,
                    "created_at": pr.created_at,
                    "url": pr.html_url,
                }
                for pr in pull_requests
            ]
            
        except Exception as e:
            print(f"Error retrieving pull requests: {e}")
