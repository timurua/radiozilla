export interface HealthResponse {
    status: string;
}

export interface WebPageSeed {
    normalized_url_hash: string;
    normalized_url: string;
    url: string;
    max_depth: number;
    url_patterns: string[] | null;
    use_headless_browser: boolean;
    allowed_domains: string[] | null;
}

export interface WebPage {
    normalized_url_hash: string;
    normalized_url: string;
    url: string;
    status_code: number;
    headers?: string[];
    content?: string;
    content_type?: string;
    content_charset?: string;
    metadata_title?: string;
    metadata_description?: string;
    metadata_image_url?: string;
    metadata_published_at?: string;
    canonical_url?: string;
    outgoing_urls?: string[];
    visible_text?: string;
    sitemap_url?: string;
    robots_content?: string[];
    text_chunks?: string[];
}

export interface WebPageSummary {
    normalized_url_hash: string;
    normalized_url: string;
}

export interface DomainStats {
    domain: string;
    frequent_subpaths: Map<string, number>;
}

export interface ScraperStats {
    initiated_urls_count: number;
    requested_urls_count: number;
    completed_urls_count: number;
    domain_stats: Map<string, DomainStats>;
}
