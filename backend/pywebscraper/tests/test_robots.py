import pytest
from pywebscraper.robots import RobotFileParser, RuleLine, Entry, AccessRule

def test_robot_file_parser_initialization():
    parser = RobotFileParser()
    assert parser.entries == []
    assert parser.sitemaps == []
    assert parser.default_entry is None
    assert parser.access_rule == AccessRule.ALLOW_ALL

def test_robot_file_parser_can_fetch_disallow_all():
    parser = RobotFileParser()
    parser.access_rule = AccessRule.DISALLOW_ALL
    assert parser.can_fetch("*", "/") is False

def test_robot_file_parser_can_fetch_allow_all():
    parser = RobotFileParser()
    parser.access_rule = AccessRule.ALLOW_ALL
    assert parser.can_fetch("*", "/") is True


def test_rule_line_initialization():
    rule = RuleLine("/path", True)
    assert rule.path == "/path"
    assert rule.allowance is True

def test_rule_line_applies_to():
    rule = RuleLine("/path", True)
    assert rule.applies_to("/path") is True
    assert rule.applies_to("/other") is False

def test_entry_initialization():
    entry = Entry()
    assert entry.useragents == []
    assert entry.rulelines == []
    assert entry.delay is None
    assert entry.req_rate is None

def test_entry_applies_to():
    entry = Entry()
    entry.useragents.append("test-agent")
    assert entry.applies_to("test-agent") is True
    assert entry.applies_to("other-agent") is False

def test_entry_allowance():
    entry = Entry()
    entry.rulelines.append(RuleLine("/path", True))
    assert entry.allowance("/path") is True
    assert entry.allowance("/other") is True
    entry.rulelines.append(RuleLine("/other", False))
    assert entry.allowance("/other") is False

def test_robot_file_parser_parse_empty_lines():
    parser = RobotFileParser()
    lines = [
        "",
        "User-agent: *",
        "",
        "Disallow: /private",
        "",
        "Allow: /public",
        "",
        "Crawl-delay: 10",
        "",
        "Request-rate: 1/5",
        "",
        "Sitemap: http://example.com/sitemap.xml",
        "",
        "User-agent: test-agent",
        "",
        "Disallow: /test",
        "",
    ]
    parser.parse(lines)

    assert len(parser.entries) == 1
    assert parser.default_entry.useragents == ["*"]
    assert parser.default_entry.rulelines[0].path == "/private"
    assert parser.default_entry.rulelines[0].allowance is False
    assert parser.default_entry.rulelines[1].path == "/public"
    assert parser.default_entry.rulelines[1].allowance is True
    assert parser.default_entry.delay == 10
    assert parser.default_entry.req_rate.requests == 1
    assert parser.default_entry.req_rate.seconds == 5
    assert parser.sitemaps == ["http://example.com/sitemap.xml"]

    assert parser.entries[0].useragents == ["test-agent"]
    assert parser.entries[0].rulelines[0].path == "/test"
    assert parser.entries[0].rulelines[0].allowance is False

def test_robot_file_parser_parse_comments():
    parser = RobotFileParser()
    lines = [
        "# This is a comment",
        "User-agent: *",
        "Disallow: /private # This is another comment",
        "Allow: /public",
        "Crawl-delay: 10",
        "Request-rate: 1/5",
        "Invalid-line",
        "Sitemap: http://example.com/sitemap.xml",
        "",
        "User-agent: test-agent",
        "Disallow: /test",
    ]
    parser.parse(lines)

    assert len(parser.entries) == 1
    assert parser.default_entry.useragents == ["*"]
    assert parser.default_entry.rulelines[0].path == "/private"
    assert parser.default_entry.rulelines[0].allowance is False
    assert parser.default_entry.rulelines[1].path == "/public"
    assert parser.default_entry.rulelines[1].allowance is True
    assert parser.default_entry.delay == 10
    assert parser.default_entry.req_rate.requests == 1
    assert parser.default_entry.req_rate.seconds == 5
    assert parser.sitemaps == ["http://example.com/sitemap.xml"]

    assert parser.entries[0].useragents == ["test-agent"]
    assert parser.entries[0].rulelines[0].path == "/test"
    assert parser.entries[0].rulelines[0].allowance is False

    parser.can_fetch("test-agent", "/test") is False
    parser.can_fetch("test-agent", "/other") is True
    parser.can_fetch("test-agent", "/") is True

    parser.can_fetch("unknown-agent", "/test") is False
    parser.can_fetch("unknown-agent", "/other") is True
    
