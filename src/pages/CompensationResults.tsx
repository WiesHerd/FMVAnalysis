import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CompensationAnalysis from '../components/CompensationAnalysis';

interface CompensationComponent {
  id: string;
  type: 'base' | 'wrvu' | 'quality' | 'admin';
  name: string;
  amount: number;
  fte?: number;
  wrvus?: number;
}

interface CompensationResult {
  provider: {
    name: string;
    specialty: string;
    components: CompensationComponent[];
  };
}

const CompensationResults: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [compensation, setCompensation] = useState<any>(null);
  const [marketData, setMarketData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get URL parameters
        const params = new URLSearchParams(location.search);
        const specialty = params.get('specialty');
        const id = params.get('id');

        if (!specialty || !id) {
          setError('Missing specialty or provider ID in URL');
          setLoading(false);
          return;
        }

        // Load provider data from localStorage
        const savedData = localStorage.getItem('employeeData');
        if (!savedData) {
          setError('No provider data found');
          setLoading(false);
          return;
        }

        const providers = JSON.parse(savedData);
        const provider = providers.find((p: any) => p.employee_id === id);
        
        if (!provider) {
          setError(`Provider with ID ${id} not found`);
          setLoading(false);
          return;
        }

        // Calculate total compensation
        const total = provider.base_pay + provider.wrvu_incentive + 
                    provider.quality_payments + provider.admin_payments;
        
        // Transform the data into the expected format
        const transformedData = {
          name: provider.full_name,
          specialty: provider.specialty,
          total: total,
          wrvus: provider.annual_wrvus,
          perWrvu: provider.conversion_factor,
          componentTotals: {
            baseTotal: provider.base_pay,
            productivityTotal: provider.wrvu_incentive,
            qualityTotal: provider.quality_payments,
            adminTotal: provider.admin_payments,
            callTotal: 0
          }
        };

        setCompensation(transformedData);

        // Load market data for the provider's specialty
        const storedMarketData = localStorage.getItem('marketData');
        if (!storedMarketData) {
          setError('No market data found');
          setLoading(false);
          return;
        }

        const marketDataArray = JSON.parse(storedMarketData);
        const specialtyData = marketDataArray.find((d: any) => 
          d.specialty.toLowerCase().trim() === provider.specialty.toLowerCase().trim()
        );

        if (!specialtyData) {
          setError(`No market data found for specialty: ${provider.specialty}`);
          setLoading(false);
          return;
        }

        const benchmarks = [
          {
            percentile: '25th',
            tcc: specialtyData.tcc_25th,
            wrvus: specialtyData.wrvu_25th,
            conversionFactor: specialtyData.tcc_per_wrvu_25th
          },
          {
            percentile: '50th',
            tcc: specialtyData.tcc_50th,
            wrvus: specialtyData.wrvu_50th,
            conversionFactor: specialtyData.tcc_per_wrvu_50th
          },
          {
            percentile: '75th',
            tcc: specialtyData.tcc_75th,
            wrvus: specialtyData.wrvu_75th,
            conversionFactor: specialtyData.tcc_per_wrvu_75th
          },
          {
            percentile: '90th',
            tcc: specialtyData.tcc_90th,
            wrvus: specialtyData.wrvu_90th,
            conversionFactor: specialtyData.tcc_per_wrvu_90th
          }
        ];

        setMarketData(benchmarks);
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Error loading data. Please try again.');
        setLoading(false);
      }
    };

    loadData();
  }, [location]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  if (!compensation || !marketData.length) {
    return <div>No data found. Please ensure market data is uploaded for {compensation?.specialty}.</div>;
  }

  // Transform components into the expected format
  const transformedComponents = {
    baseTotal: Number(compensation.componentTotals?.baseTotal) || 0,
    productivityTotal: Number(compensation.componentTotals?.productivityTotal) || 0,
    qualityTotal: Number(compensation.componentTotals?.qualityTotal) || 0,
    adminTotal: Number(compensation.componentTotals?.adminTotal) || 0,
    callTotal: Number(compensation.componentTotals?.callTotal) || 0
  };

  const analysisData = {
    providerName: compensation.name || '',
    specialty: compensation.specialty || '',
    total: Number(compensation.total) || 0,
    wrvus: Number(compensation.wrvus) || 0,
    perWrvu: Number(compensation.perWrvu) || 0,
    components: transformedComponents,
    providerProfile: {
      yearsExperience: 0,
      specialCertifications: [],
      uniqueSkills: []
    },
    qualityMetrics: {
      type: 'mixed' as const,
      metrics: []
    },
    marketData: {
      specialtyDemand: 'medium' as const,
      geographicRegion: '',
      marketCompetition: 'medium' as const,
      localMarketRates: 0,
      recruitmentDifficulty: 'medium' as const,
      costOfLiving: 100
    },
    documentation: {
      methodology: '',
      supportingDocs: [],
      lastReviewDate: ''
    },
    compliance: {
      starkCompliance: true,
      aksPolicies: true,
      referralAnalysis: {
        hasReferralConnection: false,
        referralImpact: 'none' as const
      }
    },
    businessCase: {
      needJustification: '',
      strategicAlignment: '',
      financialImpact: {
        revenue: 0,
        expenses: 0,
        roi: 0
      }
    }
  };

  return <CompensationAnalysis compensation={analysisData} benchmarks={marketData} onUpdate={() => {}} />;
};

export default CompensationResults; 