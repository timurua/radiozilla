import { HealthResponse, WebPageSeed, WebPage, ScraperStats } from '../types/api';
import axios from 'axios';

export const createURL = (api: string, params?: Record<string, string>): string => {
    const port = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? ":8001" : "";
    const url = new URL(`${window.location.protocol}//${window.location.hostname}${port}${api}`);

    if (params) {
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    }

    return url.toString();
}

export const fetchURL = async <T>(api: string): Promise<T> => {
    const response = await axios.get(createURL(api), {
        headers: {
        }
    });
    return response.data;
}

export const fetchHealth = async (): Promise<HealthResponse> => {
    return await fetchURL<HealthResponse>('/api/v1/health');
};

export const getScraperSocketPath = (): string => {
    // const url = new URL(createURL('/api/v1/scraper-ws'))
    // url.protocol = url.protocol.replace('http', 'ws');
    // return url.toString();
    return createURL('/api/v1/scraper-ws');
}

export const scraperRun = async (url: string, maxDepth: number, noCache: boolean): Promise<ScraperStats> => {
    const response = await axios.post(createURL('/api/v1/scraper-run'), { url, "max_depth": maxDepth, "no_cache": noCache }, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.data;
}

export const summarizerRun = async (url: string): Promise<ScraperStats> => {
    const response = await axios.post(createURL('/api/v1/summarizer-run'), { url }, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.data;
}


export const stopScraper = async (): Promise<any> => {
    const response = await axios.post(createURL('/api/v1/scraper-stop'), { reason: "Manual Stop" }, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.data;
}

export const fetchWebPageSeeds = async (): Promise<WebPageSeed[]> => {
    return await fetchURL<WebPageSeed[]>('/api/v1/web-page-seeds');
};

export const fetchWebPage = async (url: string): Promise<WebPage> => {
    const response = await axios.get(createURL('/api/v1/web-pages', {"url": url }), {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.data;
};

export const addWebPageSeed = async (seed: WebPageSeed): Promise<any> => {
    const response = await axios.post(createURL('/api/v1/web-page-seeds'), seed, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.data;
}

