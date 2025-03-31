import React from 'react';

interface HealthStatusProps {
  status: string | null;
}

export const HealthStatus: React.FC<HealthStatusProps> = ({ status }) => (
  <div className="p-4 rounded-lg bg-gray-100">
    <h2 className="text-xl font-semibold mb-2">System Status</h2>
    <p className="text-gray-700">
      Current Status: {' '}
      <span className={`font-bold ${status === 'healthy' ? 'text-green-600' : 'text-gray-600'}`}>
        {status ?? 'Loading...'}
      </span>
    </p>
  </div>
);