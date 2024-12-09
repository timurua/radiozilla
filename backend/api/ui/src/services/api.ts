import { HealthResponse } from '../types/api';

export const fetchURL = async (api: string): Promise<HealthResponse> => {
    const port = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? ":8000" : "";
    const url = `${window.location.protocol}//${window.location.hostname}${port}${api}`
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}

export const fetchHealth = async (): Promise<HealthResponse> => {
    return await fetchURL('/api/v1/health');
};