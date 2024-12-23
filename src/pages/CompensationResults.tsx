import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ReviewForm from '../components/ReviewForm';
import CompensationAnalysis from '../components/CompensationAnalysis';

interface CompensationComponent {
  id: string;
  type: 'base' | 'wrvu' | 'quality' | 'admin';
  name: string;
  amount: number;
  fte?: number;
  wrvus?: number;
}

const CompensationResults: React.FC = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewCompleted, setReviewCompleted] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [marketData, setMarketData] = useState<any>(null);
  const [providerId, setProviderId] = useState<string>('');
  const [providerName, setProviderName] = useState<string>('');
  const [riskLevel, setRiskLevel] = useState<'Low' | 'Medium' | 'High'>('Low');

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get provider ID from URL
        const params = new URLSearchParams(location.search);
        const id = params.get('id');
        const name = decodeURIComponent(location.pathname.split('/').pop() || '');
        const specialty = params.get('specialty');

        if (!id || !specialty) {
          setError('Missing required URL parameters');
          setLoading(false);
          return;
        }

        setProviderId(id);
        setProviderName(name);

        // Load provider data from localStorage
        const employeeData = localStorage.getItem('employeeData');
        const providers = employeeData ? JSON.parse(employeeData) : [];
        const provider = providers.find((p: any) => p.employee_id === id);

        if (!provider) {
          setError('Provider not found');
          setLoading(false);
          return;
        }

        // Calculate total compensation and components
        const total = provider.base_pay + provider.wrvu_incentive + provider.quality_payments + provider.admin_payments;
        const perWrvu = provider.annual_wrvus > 0 ? total / provider.annual_wrvus : 0;

        // Set up analysis data with actual compensation components
        const analysis = {
          providerName: provider.full_name,
          specialty: provider.specialty,
          total: total,
          wrvus: provider.annual_wrvus,
          perWrvu: perWrvu,
          components: {
            baseTotal: provider.base_pay,
            productivityTotal: provider.wrvu_incentive,
            qualityTotal: provider.quality_payments,
            adminTotal: provider.admin_payments,
            callTotal: 0 // Adding call coverage with default 0 since it's not in employee data
          }
        };

        setAnalysisData(analysis);

        // Load market data
        const marketDataStr = localStorage.getItem('marketData');
        if (marketDataStr) {
          const allMarketData = JSON.parse(marketDataStr);
          console.log('All market data:', allMarketData);
          console.log('Looking for specialty:', specialty);
          
          const matchingMarketData = allMarketData.find(
            (m: any) => m.specialty.toLowerCase() === specialty.toLowerCase()
          );
          console.log('Found matching market data:', matchingMarketData);
          
          if (matchingMarketData) {
            // Transform market data into benchmarks format
            const benchmarks = [
              {
                percentile: '10th',
                tcc: matchingMarketData.total_25th * 0.8,
                wrvus: matchingMarketData.wrvus_25th * 0.8,
                conversionFactor: matchingMarketData.cf_25th * 0.8
              },
              {
                percentile: '25th',
                tcc: matchingMarketData.total_25th,
                wrvus: matchingMarketData.wrvus_25th,
                conversionFactor: matchingMarketData.cf_25th
              },
              {
                percentile: '50th',
                tcc: matchingMarketData.total_50th,
                wrvus: matchingMarketData.wrvus_50th,
                conversionFactor: matchingMarketData.cf_50th
              },
              {
                percentile: '75th',
                tcc: matchingMarketData.total_75th,
                wrvus: matchingMarketData.wrvus_75th,
                conversionFactor: matchingMarketData.cf_75th
              },
              {
                percentile: '90th',
                tcc: matchingMarketData.total_90th,
                wrvus: matchingMarketData.wrvus_90th,
                conversionFactor: matchingMarketData.cf_90th
              }
            ];
            console.log('Created benchmarks:', benchmarks);
            setMarketData(benchmarks);
          } else {
            console.warn('No matching market data found for specialty:', specialty);
          }
        } else {
          console.warn('No market data found in localStorage');
        }

        // Load review status
        const reviewsStr = localStorage.getItem('providerReviews');
        if (reviewsStr) {
          const reviews = JSON.parse(reviewsStr);
          const review = reviews[id];
          if (review) {
            setReviewCompleted(review.status === 'Approved' || review.status === 'Rejected');
            setRiskLevel(review.risk_level as 'Low' | 'Medium' | 'High');
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Error loading provider data');
        setLoading(false);
      }
    };

    loadData();
  }, [location]);

  const calculatePercentile = (value: number, benchmarks: number[]): number => {
    const sorted = [...benchmarks].sort((a, b) => a - b);
    const position = sorted.findIndex(b => value <= b);
    if (position === -1) return 100;
    if (position === 0) return 25;
    const lowerPercentile = position * 25;
    const upperPercentile = (position + 1) * 25;
    const lowerValue = sorted[position - 1];
    const upperValue = sorted[position];
    return lowerPercentile + ((value - lowerValue) / (upperValue - lowerValue)) * 25;
  };

  const calculateRiskLevel = (tccPercentile: number, wrvuPercentile: number): 'Low' | 'Medium' | 'High' => {
    if (tccPercentile > 90 || wrvuPercentile < 25) return 'High';
    if (tccPercentile > 75 || wrvuPercentile < 50) return 'Medium';
    return 'Low';
  };

  const handleReviewComplete = () => {
    setReviewCompleted(true);
    // Optionally refresh the page or update the UI
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-6">
            <div>
              <CompensationAnalysis compensation={analysisData} benchmarks={marketData} onUpdate={() => {}} />
            </div>

            <div>
              <ReviewForm
                providerId={providerId}
                providerName={providerName}
                currentRiskLevel={riskLevel}
                onReviewComplete={handleReviewComplete}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompensationResults; 