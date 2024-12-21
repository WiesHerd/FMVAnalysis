import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Select, Card, Empty } from 'antd';

interface Provider {
  employee_id: string;
  full_name: string;
  specialty: string;
  base_pay: number;
  wrvu_incentive: number;
  quality_payments: number;
  admin_payments: number;
  annual_wrvus: number;
  conversion_factor: number;
}

const ProviderSelection: React.FC = () => {
  const [specialty, setSpecialty] = useState<string>('');
  const [provider, setProvider] = useState<string>('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load providers from localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        setLoading(true);
        const savedData = localStorage.getItem('employeeData');
        if (savedData) {
          const loadedProviders = JSON.parse(savedData) as Provider[];
          setProviders(loadedProviders);
          
          // Extract unique specialties
          const uniqueSpecialties = Array.from(
            new Set(loadedProviders.map(p => p.specialty))
          ).sort() as string[];
          setSpecialties(uniqueSpecialties);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter providers when specialty changes
  useEffect(() => {
    if (specialty) {
      const filtered = providers.filter(p => p.specialty === specialty);
      setFilteredProviders(filtered);
      setProvider(''); // Reset provider selection when specialty changes
    } else {
      setFilteredProviders([]);
    }
  }, [specialty, providers]);

  const handleProviderSelect = (providerId: string) => {
    const selectedProvider = providers.find(p => p.employee_id === providerId);
    if (selectedProvider) {
      // Navigate to the results page with the correct URL format
      navigate(`/results/${encodeURIComponent(selectedProvider.full_name)}?specialty=${encodeURIComponent(selectedProvider.specialty)}&id=${encodeURIComponent(selectedProvider.employee_id)}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Card title="Provider Selection" className="shadow-sm">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Specialty
            </label>
            <Select
              placeholder="Choose a specialty"
              className="w-full"
              value={specialty}
              onChange={setSpecialty}
              options={specialties.map(s => ({ value: s, label: s }))}
              loading={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Provider
            </label>
            {specialty && filteredProviders.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No providers found for this specialty"
              />
            ) : (
              <Select
                placeholder="Choose a provider"
                className="w-full"
                value={provider}
                onChange={handleProviderSelect}
                disabled={!specialty}
                options={filteredProviders.map(p => ({ 
                  value: p.employee_id, 
                  label: p.full_name 
                }))}
                loading={loading}
              />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProviderSelection; 