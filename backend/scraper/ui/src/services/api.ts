import { HealthResponse } from '../types/api';
import axios from 'axios';

export const createURL = (api: string, params?: Record<string, string>): string => {
    const port = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? ":8001" : "";
    const url = new URL(`${window.location.protocol}//${window.location.hostname}${port}${api}`);

    if (params) {
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    }

    return url.toString();
}

export const fetchURL = async (api: string): Promise<HealthResponse> => {
    const response = await axios.get(createURL(api), {
        headers: {
        }
    });
    return response.data;
}

export const fetchHealth = async (): Promise<HealthResponse> => {
    return await fetchURL('/api/v1/health');
};

export const getScraperSocketPath = (): string => {
    // const url = new URL(createURL('/api/v1/scraper-ws'))
    // url.protocol = url.protocol.replace('http', 'ws');
    // return url.toString();
    return createURL('/api/v1/scraper-ws');
}

export const startScraper = async (url: string, maxdepth: number): Promise<any> => {
    const response = await axios.post(createURL('/api/v1/scraper-start'), { url, "max_depth": maxdepth }, {
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

