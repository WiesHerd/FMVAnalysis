import React from 'react';
import { Card } from 'antd';

interface CompensationResultsProps {
  compensation: {
    total: number;
    wrvus: number;
    perWrvu: number;
    components: {
      baseTotal: number;
      productivityTotal: number;
      callTotal: number;
      adminTotal: number;
      qualityTotal: number;
    };
    providerName: string;
    specialty: string;
    providerProfile: {
      yearsExperience: number;
      specialCertifications: string[];
      uniqueSkills: string[];
    };
    qualityMetrics: {
      type: string;
      metrics: any[];
    };
    marketData: any;
    businessCase: {
      roi: number;
      paybackPeriod: number;
      npv: number;
    };
  };
  benchmarks: Benchmark[];
}

interface Benchmark {
  tcc: number;
  wrvus: number;
  conversionFactor: number;
  percentile: string;
}

const getPercentilePosition = (value: number, type: 'tcc' | 'wrvus' | 'conversionFactor', benchmarks: Benchmark[]): number => {
  const benchmarkData = benchmarks
    .map(b => ({ value: b[type], percentile: parseInt(b.percentile) }))
    .sort((a, b) => a.value - b.value);

  if (benchmarkData.length === 0) return 0;

  // If value is less than lowest benchmark
  if (value <= benchmarkData[0].value) {
    return benchmarkData[0].percentile * (value / benchmarkData[0].value);
  }

  // If value is greater than highest benchmark
  if (value >= benchmarkData[benchmarkData.length - 1].value) {
    return benchmarkData[benchmarkData.length - 1].percentile;
  }

  // Find the two benchmarks to interpolate between
  for (let i = 0; i < benchmarkData.length - 1; i++) {
    const lower = benchmarkData[i];
    const upper = benchmarkData[i + 1];
    
    if (value >= lower.value && value <= upper.value) {
      // Linear interpolation formula: percentile = p1 + (value - v1) * (p2 - p1) / (v2 - v1)
      return lower.percentile + 
        (value - lower.value) * 
        (upper.percentile - lower.percentile) / 
        (upper.value - lower.value);
    }
  }

  return 0; // Fallback
};

const CompensationResults: React.FC<CompensationResultsProps> = ({ compensation, benchmarks }) => {
  return (
    <div className="space-y-6">
      {/* Market Position Visualization */}
      <div>
        <h2 className="text-xl font-light text-gray-900 mb-6">Market Position</h2>
        <div className="space-y-8">
          {/* Total Cash Position */}
          <div>
            <div className="flex justify-between mb-3">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Cash Compensation</span>
              <span className="text-sm font-medium text-blue-600 print:text-blue-800">
                {getPercentilePosition(compensation.total, 'tcc', benchmarks).toFixed(1)}th percentile
              </span>
            </div>
            <div className="relative">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-100 print:bg-blue-50 print:border print:border-blue-200">
                <div
                  style={{ width: `${getPercentilePosition(compensation.total, 'tcc', benchmarks)}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 print:bg-blue-700"
                />
              </div>
              {/* Tick marks */}
              <div className="absolute top-0 w-full">
                <div className="relative h-2">
                  <div style={{ left: '0%' }} className="absolute w-0.5 h-2 bg-gray-300 print:bg-gray-400" />
                  <div style={{ left: '20%' }} className="absolute w-0.5 h-2 bg-gray-300 print:bg-gray-400" />
                  <div style={{ left: '40%' }} className="absolute w-0.5 h-2 bg-gray-300 print:bg-gray-400" />
                  <div style={{ left: '60%' }} className="absolute w-0.5 h-2 bg-gray-300 print:bg-gray-400" />
                  <div style={{ left: '80%' }} className="absolute w-0.5 h-2 bg-gray-300 print:bg-gray-400" />
                  <div style={{ left: '100%' }} className="absolute w-0.5 h-2 bg-gray-300 print:bg-gray-400" />
                </div>
              </div>
              {/* Percentile labels */}
              <div className="relative w-full mt-1">
                <div style={{ left: '0%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400 print:text-gray-600">0</div>
                <div style={{ left: '20%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400 print:text-gray-600">20th</div>
                <div style={{ left: '40%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400 print:text-gray-600">40th</div>
                <div style={{ left: '60%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400 print:text-gray-600">60th</div>
                <div style={{ left: '80%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400 print:text-gray-600">80th</div>
                <div style={{ left: '100%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400 print:text-gray-600">100th</div>
              </div>
            </div>
          </div>

          {/* wRVUs Position */}
          <div>
            <div className="flex justify-between mb-3">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Annual wRVUs</span>
              <span className="text-sm font-medium text-green-600 print:text-green-800">
                {getPercentilePosition(compensation.wrvus, 'wrvus', benchmarks).toFixed(1)}th percentile
              </span>
            </div>
            <div className="relative">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-green-100 print:bg-green-50 print:border print:border-green-200">
                <div
                  style={{ width: `${getPercentilePosition(compensation.wrvus, 'wrvus', benchmarks)}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 print:bg-green-700"
                />
              </div>
              {/* Tick marks */}
              <div className="absolute top-0 w-full">
                <div className="relative h-2">
                  <div style={{ left: '0%' }} className="absolute w-0.5 h-2 bg-gray-300 print:bg-gray-400" />
                  <div style={{ left: '20%' }} className="absolute w-0.5 h-2 bg-gray-300 print:bg-gray-400" />
                  <div style={{ left: '40%' }} className="absolute w-0.5 h-2 bg-gray-300 print:bg-gray-400" />
                  <div style={{ left: '60%' }} className="absolute w-0.5 h-2 bg-gray-300 print:bg-gray-400" />
                  <div style={{ left: '80%' }} className="absolute w-0.5 h-2 bg-gray-300 print:bg-gray-400" />
                  <div style={{ left: '100%' }} className="absolute w-0.5 h-2 bg-gray-300 print:bg-gray-400" />
                </div>
              </div>
              {/* Percentile labels */}
              <div className="relative w-full mt-1">
                <div style={{ left: '0%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400 print:text-gray-600">0</div>
                <div style={{ left: '20%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400 print:text-gray-600">20th</div>
                <div style={{ left: '40%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400 print:text-gray-600">40th</div>
                <div style={{ left: '60%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400 print:text-gray-600">60th</div>
                <div style={{ left: '80%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400 print:text-gray-600">80th</div>
                <div style={{ left: '100%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400 print:text-gray-600">100th</div>
              </div>
            </div>
          </div>

          {/* Conversion Factor Position */}
          <div>
            <div className="flex justify-between mb-3">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Conversion Factor</span>
              <span className="text-sm font-medium text-purple-600 print:text-purple-800">
                {getPercentilePosition(compensation.perWrvu, 'conversionFactor', benchmarks).toFixed(1)}th percentile
              </span>
            </div>
            <div className="relative">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-purple-100 print:bg-purple-50 print:border print:border-purple-200">
                <div
                  style={{ width: `${getPercentilePosition(compensation.perWrvu, 'conversionFactor', benchmarks)}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500 print:bg-purple-700"
                />
              </div>
              {/* Tick marks */}
              <div className="absolute top-0 w-full">
                <div className="relative h-2">
                  <div style={{ left: '0%' }} className="absolute w-0.5 h-2 bg-gray-300 print:bg-gray-400" />
                  <div style={{ left: '20%' }} className="absolute w-0.5 h-2 bg-gray-300 print:bg-gray-400" />
                  <div style={{ left: '40%' }} className="absolute w-0.5 h-2 bg-gray-300 print:bg-gray-400" />
                  <div style={{ left: '60%' }} className="absolute w-0.5 h-2 bg-gray-300 print:bg-gray-400" />
                  <div style={{ left: '80%' }} className="absolute w-0.5 h-2 bg-gray-300 print:bg-gray-400" />
                  <div style={{ left: '100%' }} className="absolute w-0.5 h-2 bg-gray-300 print:bg-gray-400" />
                </div>
              </div>
              {/* Percentile labels */}
              <div className="relative w-full mt-1">
                <div style={{ left: '0%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400 print:text-gray-600">0</div>
                <div style={{ left: '20%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400 print:text-gray-600">20th</div>
                <div style={{ left: '40%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400 print:text-gray-600">40th</div>
                <div style={{ left: '60%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400 print:text-gray-600">60th</div>
                <div style={{ left: '80%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400 print:text-gray-600">80th</div>
                <div style={{ left: '100%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400 print:text-gray-600">100th</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompensationResults; 