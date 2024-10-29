# test_github_datasource.py

import os
import pytest
from backend.datasources.github import GithubDatasource

# Ensure you have set your GitHub personal access token as an environment variable
GITHUB_ACCESS_TOKEN = os.getenv("GITHUB_ACCESS_TOKEN")

@pytest.mark.skipif(
    not GITHUB_ACCESS_TOKEN, reason="GITHUB_ACCESS_TOKEN environment variable is not set."
)
def test_connect():
    """Test connecting to GitHub with a valid access token."""
    datasource = GithubDatasource(access_token=GITHUB_ACCESS_TOKEN)
    datasource.connect()
    assert datasource.client is not None, "Failed to connect to GitHub"

@pytest.mark.skipif(
    not GITHUB_ACCESS_TOKEN, reason="GITHUB_ACCESS_TOKEN environment variable is not set."
)
def test_read_repositories():
    """Test reading repositories for the authenticated user."""
    datasource = GithubDatasource(access_token=GITHUB_ACCESS_TOKEN)
    datasource.connect()
    
    repos = datasource.read_repositories()
    assert isinstance(repos, list), "Repositories should be returned as a list"
    assert len(repos) > 0, "Expected at least one repository"

@pytest.mark.skipif(
    not GITHUB_ACCESS_TOKEN, reason="GITHUB_ACCESS_TOKEN environment variable is not set."
)
def test_read_prs():
    """Test reading pull requests for a particular repository."""
    datasource = GithubDatasource(access_token=GITHUB_ACCESS_TOKEN)
    datasource.connect()

    # Replace with a real repository that has pull requests
    repo_name = "octocat/Hello-World"  # Example public repo
    prs = datasource.read_prs(repo_name=repo_name)

    assert isinstance(prs, list), "PRs should be returned as a list"
    if prs:
        assert "number" in prs[0], "PR dictionary should contain 'number'"
        assert "title" in prs[0], "PR dictionary should contain 'title'"
