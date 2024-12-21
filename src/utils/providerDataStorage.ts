import { RiskAnalysis, CompensationComponents } from '../types/compensation';

interface ProviderDashboardData {
  providerId: string;
  lastUpdated: string;
  compensation: {
    total: number;
    wrvus: number;
    perWrvu: number;
    components: CompensationComponents;
  };
  riskAnalysis: RiskAnalysis;
  notes: string[];
  reviewStatus: 'pending' | 'approved' | 'rejected';
  reviewHistory: Array<{
    timestamp: string;
    status: string;
    reviewer: string;
    notes: string;
  }>;
  customAnalysis: {
    findings: string[];
    recommendations: string[];
    contextualFactors: Record<string, any>;
  };
}

const STORAGE_KEY = 'providerDashboards';

export const saveProviderDashboard = (data: ProviderDashboardData): void => {
  try {
    // Get existing dashboards
    const existingData = localStorage.getItem(STORAGE_KEY);
    const dashboards = existingData ? JSON.parse(existingData) : {};
    
    // Update the dashboard for this provider
    dashboards[data.providerId] = {
      ...data,
      lastUpdated: new Date().toISOString()
    };
    
    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboards));
  } catch (error) {
    console.error('Error saving provider dashboard:', error);
    throw new Error('Failed to save provider dashboard');
  }
};

export const getProviderDashboard = (providerId: string): ProviderDashboardData | null => {
  try {
    const existingData = localStorage.getItem(STORAGE_KEY);
    if (!existingData) return null;
    
    const dashboards = JSON.parse(existingData);
    return dashboards[providerId] || null;
  } catch (error) {
    console.error('Error loading provider dashboard:', error);
    return null;
  }
};

export const updateProviderDashboard = (
  providerId: string,
  updates: Partial<ProviderDashboardData>
): void => {
  try {
    const existingData = localStorage.getItem(STORAGE_KEY);
    const dashboards = existingData ? JSON.parse(existingData) : {};
    
    if (!dashboards[providerId]) {
      throw new Error('Provider dashboard not found');
    }
    
    dashboards[providerId] = {
      ...dashboards[providerId],
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboards));
  } catch (error) {
    console.error('Error updating provider dashboard:', error);
    throw new Error('Failed to update provider dashboard');
  }
};

export const deleteProviderDashboard = (providerId: string): void => {
  try {
    const existingData = localStorage.getItem(STORAGE_KEY);
    if (!existingData) return;
    
    const dashboards = JSON.parse(existingData);
    delete dashboards[providerId];
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboards));
  } catch (error) {
    console.error('Error deleting provider dashboard:', error);
    throw new Error('Failed to delete provider dashboard');
  }
};

export const getAllProviderDashboards = (): Record<string, ProviderDashboardData> => {
  try {
    const existingData = localStorage.getItem(STORAGE_KEY);
    return existingData ? JSON.parse(existingData) : {};
  } catch (error) {
    console.error('Error loading all provider dashboards:', error);
    return {};
  }
};

interface Provider {
  id: string;
  name: string;
  specialty: string;
  basePay: number;
  wRVUIncentive: number;
  quality: number;
  admin: number;
  annualWRVUs: number;
  conversionFactor: number;
}

const PROVIDER_STORAGE_KEY = 'providers';

// Initialize with sample data if empty
export const initializeSampleData = () => {
  const sampleProviders = [
    {
      id: 'EMP001',
      name: 'Jason Johnson',
      specialty: 'Dermatology',
      basePay: 302024,
      wRVUIncentive: 72872,
      quality: 28452,
      admin: 4598,
      annualWRVUs: 5244,
      conversionFactor: 50
    },
    {
      id: 'EMP002',
      name: 'Amy Boyle',
      specialty: 'Dermatology',
      basePay: 293324,
      wRVUIncentive: 48322,
      quality: 12717,
      admin: 8104,
      annualWRVUs: 5874,
      conversionFactor: 50
    },
    {
      id: 'EMP003',
      name: 'Yesenia Mcguire',
      specialty: 'Internal Medicine',
      basePay: 254615,
      wRVUIncentive: 78844,
      quality: 17291,
      admin: 15392,
      annualWRVUs: 5735,
      conversionFactor: 47
    },
    {
      id: 'EMP004',
      name: 'Nicholas James',
      specialty: 'General Surgery',
      basePay: 336922,
      wRVUIncentive: 79049,
      quality: 15863,
      admin: 18434,
      annualWRVUs: 7090,
      conversionFactor: 70
    },
    {
      id: 'EMP005',
      name: 'Michelle Davis',
      specialty: 'Anesthesiology',
      basePay: 354330,
      wRVUIncentive: 107026,
      quality: 26441,
      admin: 3479,
      annualWRVUs: 7618,
      conversionFactor: 60
    },
    {
      id: 'EMP006',
      name: 'Jeffrey Guerra',
      specialty: 'Anesthesiology',
      basePay: 332111,
      wRVUIncentive: 69164,
      quality: 16396,
      admin: 9197,
      annualWRVUs: 6209,
      conversionFactor: 60
    },
    {
      id: 'EMP007',
      name: 'Allison Potter',
      specialty: 'Cardiology',
      basePay: 316550,
      wRVUIncentive: 80149,
      quality: 27497,
      admin: 130,
      annualWRVUs: 6842,
      conversionFactor: 66
    }
  ];

  localStorage.setItem(PROVIDER_STORAGE_KEY, JSON.stringify(sampleProviders));
  return sampleProviders;
};

export const getProviders = async () => {
  try {
    const data = localStorage.getItem(PROVIDER_STORAGE_KEY);
    if (!data) {
      return initializeSampleData();
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading provider data:', error);
    return [];
  }
};

export const addProvider = async (provider) => {
  const providers = await getProviders();
  providers.push(provider);
  localStorage.setItem(PROVIDER_STORAGE_KEY, JSON.stringify(providers));
};

export const updateProvider = async (id, updatedProvider) => {
  const providers = await getProviders();
  const index = providers.findIndex(p => p.id === id);
  if (index !== -1) {
    providers[index] = { ...providers[index], ...updatedProvider };
    localStorage.setItem(PROVIDER_STORAGE_KEY, JSON.stringify(providers));
  }
};

export const deleteProvider = async (id) => {
  const providers = await getProviders();
  const filtered = providers.filter(p => p.id !== id);
  localStorage.setItem(PROVIDER_STORAGE_KEY, JSON.stringify(filtered));
};

export const getProviderById = async (id) => {
  const providers = await getProviders();
  return providers.find(p => p.id === id);
};

export const getProvidersBySpecialty = async (specialty) => {
  const providers = await getProviders();
  return providers.filter(p => p.specialty === specialty);
}; 