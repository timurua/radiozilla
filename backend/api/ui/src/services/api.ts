import { HealthResponse } from '../types/api';

export const fetchHealth = async (): Promise<HealthResponse> => {
  const response = await fetch('/api/v1/health');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};