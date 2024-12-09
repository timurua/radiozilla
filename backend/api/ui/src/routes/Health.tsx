import React, { useState, useEffect } from 'react';
import { HealthStatus } from '../components/HealthStatus';
import { fetchHealth } from '../services/api';

const App: React.FC = () => {
  const [health, setHealth] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getHealthStatus = async () => {
      try {
        const response = await fetchHealth();
        setHealth(response.status);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    getHealthStatus();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">PyAPI Frontend</h1>
      {error ? (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          Error: {error}
        </div>
      ) : (
        <HealthStatus status={health} />
      )}
    </div>
  );
};

export default App;