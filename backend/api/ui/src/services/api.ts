import { HealthResponse } from '../types/api';
import axios from 'axios';

export const createURL = (api: string, params?: Record<string, string>): string => {
    const port = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? ":8000" : "";
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

export const fetchSimilar = async (text: string): Promise<string> => {
    const response = await axios.post(createURL('/api/v1/similar'), { text }, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.data;
}

export const fetchEmbedding = async (text: string): Promise<string> => {
    const response = await axios.get(createURL(`/api/v1/embedding`), {
        params: { text }
    });
    return response.data;
}

export const storeEmbedding = async (text: string): Promise<string> => {
    const response = await axios.post(createURL('/api/v1/embedding'), { text }, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.data;
}

