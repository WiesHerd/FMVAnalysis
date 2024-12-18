import React from 'react';
import { Card } from './ui';
import CompensationAnalysis from './CompensationAnalysis';
import CompensationComponents from './CompensationComponents';
import MarketData from './MarketData';

interface CompensationResultsProps {
  providerName: string;
  specialty: string;
  compensation: {
    total: number;
    wrvus: number;
    perWrvu: number;
    components: {
      baseTotal: number;
      productivityTotal: number;
      callTotal: number;
      adminTotal: number;
    };
  };
  marketData: any;
  benchmarks: any[];
}

const CompensationResults: React.FC<CompensationResultsProps> = ({
  providerName,
  specialty,
  compensation,
  marketData,
  benchmarks
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center py-8 border-b print:border-none print:py-4">
        <h1 className="text-4xl font-light text-gray-900 mb-2">{providerName}</h1>
        <div className="text-xl text-gray-600 font-light">Specialty: {specialty}</div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-8 mt-8 print:gap-6 print:mt-4">
        <Card title="Total Cash Compensation">
          <div className="text-3xl font-light text-gray-900">
            ${compensation.total.toLocaleString()}
          </div>
          <div className="text-sm text-blue-600 font-medium mt-1">
            {benchmarks.length > 0 ? `${getPercentile(compensation.total, benchmarks, 'total')}th percentile` : 'No benchmark data'}
          </div>
        </Card>

        <Card title="Annual wRVUs">
          <div className="text-3xl font-light text-gray-900">
            {compensation.wrvus.toLocaleString()}
          </div>
          <div className="text-sm text-green-600 font-medium mt-1">
            {benchmarks.length > 0 ? `${getPercentile(compensation.wrvus, benchmarks, 'wrvus')}th percentile` : 'No benchmark data'}
          </div>
        </Card>

        <Card title="Compensation per wRVU">
          <div className="text-3xl font-light text-gray-900">
            ${compensation.perWrvu.toFixed(2)}
          </div>
          <div className="text-sm text-purple-600 font-medium mt-1">
            {benchmarks.length > 0 ? `${getPercentile(compensation.perWrvu, benchmarks, 'perWrvu')}th percentile` : 'No benchmark data'}
          </div>
        </Card>
      </div>

      {/* Market Analysis */}
      <div className="mt-12 grid grid-cols-2 gap-8 print:mt-8">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Market Position</h3>
          <MarketData marketData={marketData} />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Compensation Components</h3>
          <CompensationComponents
            initialComponents={[
              {
                id: 'base',
                type: 'base',
                name: 'Base Salary',
                amount: compensation.components.baseTotal,
                fte: 1.0
              },
              {
                id: 'productivity',
                type: 'incentive',
                name: 'Productivity',
                amount: compensation.components.productivityTotal,
                wrvus: compensation.wrvus
              },
              {
                id: 'call',
                type: 'admin',
                name: 'Call Coverage',
                amount: compensation.components.callTotal
              },
              {
                id: 'admin',
                type: 'admin',
                name: 'Administrative',
                amount: compensation.components.adminTotal
              }
            ]}
            onChange={() => {}}
          />
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="mt-12 print:mt-8">
        <CompensationAnalysis
          compensation={{
            ...compensation,
            providerName,
            specialty,
            marketData,
            providerProfile: {
              yearsExperience: 0,
              specialCertifications: [],
              uniqueSkills: []
            },
            qualityMetrics: {
              type: 'objective',
              metrics: []
            },
            documentation: {
              methodology: '',
              supportingDocs: [],
              lastReviewDate: new Date().toISOString()
            },
            compliance: {
              starkCompliance: true,
              aksPolicies: true,
              referralAnalysis: {
                hasReferralConnection: false,
                referralImpact: 'none'
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
          }}
          benchmarks={benchmarks}
          onUpdate={() => {}}
        />
      </div>
    </div>
  );
};

const getPercentile = (value: number, benchmarks: any[], field: string): number => {
  const sortedValues = benchmarks
    .map(b => b[field])
    .sort((a, b) => a - b);
  
  const position = sortedValues.findIndex(v => v >= value);
  if (position === -1) return 100;
  
  return Math.round((position / sortedValues.length) * 100);
};

export default CompensationResults; 