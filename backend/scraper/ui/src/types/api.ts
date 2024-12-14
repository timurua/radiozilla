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