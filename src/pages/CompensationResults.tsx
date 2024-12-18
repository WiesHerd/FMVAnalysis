import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [compensation, setCompensation] = useState<any>(null);
  const [marketData, setMarketData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load compensation results
    const storedResults = localStorage.getItem('compensationResults');
    console.log('Raw stored results:', storedResults);
    
    if (storedResults) {
      try {
        const results = JSON.parse(storedResults);
        console.log('Parsed results:', results);
        
        if (results && results.provider) {
          console.log('Provider data:', results.provider);
          console.log('Component totals:', results.provider.componentTotals);
          console.log('Components:', results.provider.components);
          
          // Transform components into the expected format
          const transformedComponents = {
            baseTotal: Number(results.provider.componentTotals.baseTotal) || 0,
            productivityTotal: Number(results.provider.componentTotals.productivityTotal) || 0,
            qualityTotal: Number(results.provider.componentTotals.qualityTotal) || 0,
            adminTotal: Number(results.provider.componentTotals.adminTotal) || 0,
            callTotal: Number(results.provider.componentTotals.callTotal) || 0
          };

          // Set the compensation data with transformed components
          setCompensation({
            ...results.provider,
            components: transformedComponents
          });
        }
      } catch (error) {
        console.error('Error parsing compensation results:', error);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!compensation?.specialty) return;

    // Load market data
    const storedMarketData = localStorage.getItem('marketData');
    if (storedMarketData) {
      try {
        const data = JSON.parse(storedMarketData);
        console.log('Loaded market data:', data);
        console.log('Looking for specialty:', compensation.specialty);
        
        // Find the matching specialty data
        const specialtyData = data.find((d: any) => 
          d.specialty.toLowerCase() === compensation.specialty.toLowerCase()
        );
        console.log('Found specialty data:', specialtyData);
        
        if (specialtyData) {
          // Transform market data into benchmarks format
          const benchmarks = [
            {
              percentile: '10th',
              tcc: specialtyData.percentile_25th * 0.8,
              wrvus: specialtyData.wrvu_25th * 0.8,
              conversionFactor: specialtyData.cf_25th * 0.8
            },
            {
              percentile: '25th',
              tcc: specialtyData.percentile_25th,
              wrvus: specialtyData.wrvu_25th,
              conversionFactor: specialtyData.cf_25th
            },
            {
              percentile: '50th',
              tcc: specialtyData.percentile_50th,
              wrvus: specialtyData.wrvu_50th,
              conversionFactor: specialtyData.cf_50th
            },
            {
              percentile: '75th',
              tcc: specialtyData.percentile_75th,
              wrvus: specialtyData.wrvu_75th,
              conversionFactor: specialtyData.cf_75th
            },
            {
              percentile: '90th',
              tcc: specialtyData.percentile_90th,
              wrvus: specialtyData.wrvu_90th,
              conversionFactor: specialtyData.cf_90th
            }
          ];
          console.log('Setting benchmarks:', benchmarks);
          setMarketData(benchmarks);
        }
      } catch (error) {
        console.error('Error parsing market data:', error);
      }
    }
  }, [compensation?.specialty]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!compensation) {
    return <div>No compensation data found</div>;
  }

  console.log('Current compensation state:', compensation);
  console.log('Components:', compensation.components);
  console.log('Component totals:', compensation.componentTotals);

  // Transform components into the expected format
  const transformedComponents = {
    baseTotal: Number(compensation.componentTotals?.baseTotal) || 0,
    productivityTotal: Number(compensation.componentTotals?.productivityTotal) || 0,
    qualityTotal: Number(compensation.componentTotals?.qualityTotal) || 0,
    adminTotal: Number(compensation.componentTotals?.adminTotal) || 0,
    callTotal: Number(compensation.componentTotals?.callTotal) || 0
  };

  console.log('Final transformed components:', transformedComponents);

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

  // Default benchmarks if no market data is available
  const defaultBenchmarks = [
    { 
      percentile: '10th', 
      tcc: analysisData.total * 0.6,
      clinicalFte: 0.7,
      wrvus: analysisData.wrvus * 0.6,
      conversionFactor: analysisData.perWrvu * 0.6,
      callRate: 800,
      adminRate: 125
    },
    { 
      percentile: '25th', 
      tcc: analysisData.total * 0.8,
      clinicalFte: 0.8,
      wrvus: analysisData.wrvus * 0.8,
      conversionFactor: analysisData.perWrvu * 0.8,
      callRate: 1000,
      adminRate: 150
    },
    { 
      percentile: '50th', 
      tcc: analysisData.total,
      clinicalFte: 0.9,
      wrvus: analysisData.wrvus,
      conversionFactor: analysisData.perWrvu,
      callRate: 1200,
      adminRate: 175
    },
    { 
      percentile: '75th', 
      tcc: analysisData.total * 1.2,
      clinicalFte: 1.0,
      wrvus: analysisData.wrvus * 1.2,
      conversionFactor: analysisData.perWrvu * 1.2,
      callRate: 1400,
      adminRate: 200
    },
    { 
      percentile: '90th', 
      tcc: analysisData.total * 1.4,
      clinicalFte: 1.0,
      wrvus: analysisData.wrvus * 1.4,
      conversionFactor: analysisData.perWrvu * 1.4,
      callRate: 1600,
      adminRate: 225
    },
    { 
      percentile: '100th', 
      tcc: analysisData.total * 1.6,
      clinicalFte: 1.0,
      wrvus: analysisData.wrvus * 1.6,
      conversionFactor: analysisData.perWrvu * 1.6,
      callRate: 1800,
      adminRate: 250
    }
  ];

  const benchmarksToUse = marketData.length > 0 ? marketData.map(benchmark => ({
    ...benchmark,
    conversionFactor: benchmark.conversionFactor || (benchmark.tcc / benchmark.wrvus)
  })) : defaultBenchmarks;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <CompensationAnalysis
        compensation={analysisData}
        benchmarks={benchmarksToUse}
        onUpdate={() => {}}
      />
    </div>
  );
};

export default CompensationResults; 