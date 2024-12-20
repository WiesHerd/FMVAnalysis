// src/components/Dashboard.tsx
import { useState } from 'react';
import ProviderSelect from './ProviderSelect';
import CompensationForm from './CompensationForm';
import MarketDataUpload from './MarketDataUpload';

const Dashboard = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');

  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <h1 className="text-2xl font-bold text-gray-800">FMV Analyzer</h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-3">
            <ProviderSelect 
              onSpecialtyChange={setSelectedSpecialty}
              onProviderChange={setSelectedProvider}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <div className="space-y-6">
              <CompensationForm 
                specialty={selectedSpecialty}
                providerId={selectedProvider}
              />
              <MarketDataUpload />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;