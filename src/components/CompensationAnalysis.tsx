import React, { useState, useMemo, useContext, useCallback, useEffect } from 'react';
import { Card, Typography, Space } from 'antd';
import Modal from './Modal';
import TrashIcon from './TrashIcon';
import { calculatePercentile } from '../utils/calculations';
import type { RiskLevel, RiskScore, RiskFactor, RiskFactorContext, ReferralImpact } from '../types/fmvRiskAnalysis';

const { Title, Text } = Typography;

// Helper functions
const calculateMonthsSinceReview = (reviewDate: Date | null): number => {
  if (!reviewDate) return 12;
  return (new Date().getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
};

interface Benchmark {
  percentile: string;
  tcc: number;
  clinicalFte: number;
  wrvus: number;
  conversionFactor: number;
  callRate: number;
  adminRate: number;
}

interface RiskMetric {
  name: string;
  score: RiskScore;
  description: string;
  severity: RiskLevel;
  recommendations: string[];
}

interface RiskAnalysis {
  factors: RiskFactor[];
  totalScore: number;
  overallRisk: RiskLevel;
  summary: string;
  overallScore: number;
  metrics: RiskMetric[];
  severity: RiskLevel;
  contextualFactors: RiskFactorContext;
}

interface MarketData {
  specialtyDemand: 'low' | 'medium' | 'high';
  geographicRegion: string;
  marketCompetition: 'low' | 'medium' | 'high';
  localMarketRates: number;
  recruitmentDifficulty: 'low' | 'medium' | 'high';
  costOfLiving: number;
}

interface CompensationAnalysisProps {
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
    marketData: MarketData;
    providerProfile: {
      yearsExperience: number;
      specialCertifications: string[];
      academicAppointment?: string;
      uniqueSkills: string[];
    };
    qualityMetrics: {
      type: 'objective' | 'subjective' | 'mixed';
      metrics: Array<{
        name: string;
        target: number;
        actual: number;
        weight: number;
      }>;
    };
    documentation: {
      methodology: string;
      supportingDocs: string[];
      lastReviewDate: string;
    };
    compliance: {
      starkCompliance: boolean;
      aksPolicies: boolean;
      referralAnalysis: {
        hasReferralConnection: boolean;
        referralImpact: 'none' | 'indirect' | 'direct';
      };
    };
    businessCase: {
      needJustification: string;
      strategicAlignment: string;
      financialImpact: {
        revenue: number;
        expenses: number;
        roi: number;
      };
    };
  };
  benchmarks: Benchmark[];
  onUpdate: (updates: Partial<{
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
  }>) => void;
}

interface CompensationComponents {
  baseTotal: number;
  productivityTotal: number;
  callTotal: number;
  adminTotal: number;
  qualityTotal: number;
}

interface RiskFactor {
  category: string;
  score: RiskScore;
  riskLevel: RiskLevel;
  description: string;
  findings: string[];
  recommendations: string[];
}

interface RiskAnalysis {
  factors: RiskFactor[];
  totalScore: number;
  overallRisk: RiskLevel;
  summary: string;
  overallScore: number;
  metrics: RiskMetric[];
  severity: RiskLevel;
  contextualFactors: RiskFactorContext;
}

// Add new interfaces for risk scoring
interface RiskScoreRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  score: RiskScore;
  isEnabled: boolean;
}

interface RiskScoreAdjustment {
  id: string;
  description: string;
  score: number;
}

// Add new interfaces for editable context
interface MarketContext {
  specialtyDemand: 'low' | 'medium' | 'high';
  geographicRegion: string;
  marketCompetition: 'low' | 'medium' | 'high';
  localMarketRates: number;
  recruitmentDifficulty: 'low' | 'medium' | 'high';
  costOfLiving: number;
}

interface RiskFactorContext {
  market: {
    specialtyDemand: 'low' | 'medium' | 'high';
    geographicRegion: string;
    marketCompetition: 'low' | 'medium' | 'high';
    localMarketRates: number;
    recruitmentDifficulty: 'low' | 'medium' | 'high';
    costOfLiving: number;
  };
  provider: {
    yearsExperience: number;
    specialCertifications: string[];
    uniqueSkills: string[];
    academicAppointment?: string;
    specialty?: string;
    name?: string;
  };
  practice: {
    caseComplexity: 'low' | 'medium' | 'high';
    qualityMetrics: {
      type: 'objective' | 'subjective' | 'mixed';
      metrics: { name: string; target: number; actual: number; weight: number; }[];
      score: number;
      benchmark: number;
    };
    patientSatisfaction: {
      score: number;
      benchmark: number;
    };
    procedureMix: {
      highComplexity: number;
      lowComplexity: number;
    };
  };
  program: {
    researchActive: boolean;
    teachingResponsibilities: boolean;
    strategicImportance: 'low' | 'medium' | 'high';
    leadershipRole?: string;
  };
  compensation: {
    total: number;
    tccPercentile: number;
    wrvuPercentile: number;
    components: {
      baseTotal: number;
      productivityTotal: number;
      callTotal: number;
      adminTotal: number;
    };
  };
  documentation: {
    lastReviewDate: string;
    methodology: string;
    supportingDocs: string[];
  };
  compliance: {
    starkCompliance: boolean;
    aksPolicies: boolean;
    referralAnalysis: {
      hasReferralConnection: boolean;
      referralImpact: 'none' | 'low' | 'medium' | 'high';
    };
  };
  businessCase: {
    needJustification: string;
    strategicAlignment: string;
    financialImpact: {
      revenue: number;
      expenses: number;
      roi: number;
    };
  };
}

// Add RiskScoringConfig interface
interface RiskThreshold {
  max: number;
  points: number;
  risk: 'low' | 'medium' | 'high';
}

interface RiskCategory {
  id: string;
  name: string;
  description: string;
  thresholds: RiskThreshold[];
  evaluator: (context: any) => number;
  findings: (context: any) => string[];
  recommendations: (score: number, context: any) => string[];
}

interface RiskScoringConfig {
  categories: RiskCategory[];
  riskLevels: {
    max: number;
    risk: 'low' | 'medium' | 'high';
  }[];
}

// Add default risk scoring configuration
const defaultRiskConfig: RiskScoringConfig = {
  categories: [
    {
      id: 'compensation_structure',
      name: 'Compensation Structure',
      description: 'Assessment of compensation consistency with market value considering specialty, experience, location, and demand',
      thresholds: [
        { max: 50, points: 0, risk: 'low' },
        { max: 75, points: 1, risk: 'medium' },
        { max: 90, points: 2, risk: 'medium' },
        { max: 100, points: 3, risk: 'high' }
      ],
      evaluator: (context: RiskFactorContext): RiskScore => {
        let score = 0;
        const tccPercentile = context.compensation?.tccPercentile || 0;
        
        // Market alignment
        if (tccPercentile > 90) score += 2;
        else if (tccPercentile > 75) score += 1;
        
        // Geographic and specialty considerations
        if (context.market?.costOfLiving > 125 && tccPercentile < 75) score += 1;
        if (context.market?.specialtyDemand === 'high' && tccPercentile < 50) score += 1;
        
        // Experience and qualifications
        if (context.provider?.yearsExperience > 10 && tccPercentile < 75) score += 1;
        if (context.provider?.specialCertifications?.length > 0 && tccPercentile < 75) score += 1;
        
        return Math.min(score, 3) as RiskScore;
      },
      findings: (context: RiskFactorContext) => [
        `Total compensation at ${context.compensation?.tccPercentile}th percentile`,
        `Geographic region: ${context.market?.geographicRegion}`,
        `Specialty demand: ${context.market?.specialtyDemand}`,
        `Years of experience: ${context.provider?.yearsExperience}`,
        `Special certifications: ${context.provider?.specialCertifications?.join(', ') || 'None'}`
      ],
      recommendations: (score: RiskScore, context: RiskFactorContext) => {
        const recs = [];
        if (score >= 2) {
          recs.push('Review market data for specialty and geographic region');
          recs.push('Document justification for compensation level based on experience and qualifications');
        }
        if (score <= 1) {
          recs.push('Continue monitoring market alignment');
        }
        return recs;
      }
    },
    {
      id: 'regulatory_compliance',
      name: 'Regulatory Compliance',
      description: 'Ensuring adherence to federal regulations like the Stark Law and Anti-Kickback Statute',
      thresholds: [
        { max: 1, points: 0, risk: 'low' },
        { max: 2, points: 1, risk: 'medium' },
        { max: 3, points: 2, risk: 'medium' },
        { max: 4, points: 3, risk: 'high' }
      ],
      evaluator: (context: RiskFactorContext): RiskScore => {
        let score = 0;
        
        if (!context.compliance?.starkCompliance) score += 2;
        if (!context.compliance?.aksPolicies) score += 2;
        
        if (context.compliance?.referralAnalysis?.hasReferralConnection && 
            context.compliance?.referralAnalysis?.referralImpact !== 'none') {
          score += 1;
        }
        
        return Math.min(score, 3) as RiskScore;
      },
      findings: (context: RiskFactorContext) => {
        const findings = [];
        if (!context.compliance?.starkCompliance) {
          findings.push('❌ Stark Law compliance documentation incomplete');
        }
        if (!context.compliance?.aksPolicies) {
          findings.push('❌ Anti-Kickback Statute policies not documented');
        }
        if (context.compliance?.referralAnalysis?.hasReferralConnection) {
          findings.push(`⚠️ Referral relationship identified: ${context.compliance.referralAnalysis.referralImpact} impact`);
        }
        return findings;
      },
      recommendations: (score: RiskScore, context: RiskFactorContext) => {
        const recs = [];
        if (!context.compliance?.starkCompliance) {
          recs.push('Complete Stark Law compliance documentation');
        }
        if (!context.compliance?.aksPolicies) {
          recs.push('Implement Anti-Kickback Statute policies');
        }
        if (context.compliance?.referralAnalysis?.hasReferralConnection) {
          recs.push('Document referral relationship analysis and safeguards');
        }
        return recs;
      }
    },
    {
      id: 'commercial_reasonableness',
      name: 'Commercial Reasonableness',
      description: 'Evaluating if the arrangement makes sense from a business perspective, independent of potential referrals',
      thresholds: [
        { max: 1, points: 0, risk: 'low' },
        { max: 2, points: 1, risk: 'medium' },
        { max: 3, points: 2, risk: 'medium' },
        { max: 4, points: 3, risk: 'high' }
      ],
      evaluator: (context: RiskFactorContext): RiskScore => {
        let score = 0;
        
        if (!context.businessCase?.needJustification) score += 1;
        if (!context.businessCase?.strategicAlignment) score += 1;
        
        const roi = context.businessCase?.financialImpact?.roi || 0;
        if (roi < 0) score += 2;
        else if (roi < 1) score += 1;
        
        if (!context.documentation?.methodology) score += 1;
        
        return Math.min(score, 3) as RiskScore;
      },
      findings: (context: RiskFactorContext) => {
        const findings = [];
        findings.push(`Business need: ${context.businessCase?.needJustification || 'Not documented'}`);
        findings.push(`Strategic alignment: ${context.businessCase?.strategicAlignment || 'Not documented'}`);
        findings.push(`ROI: ${context.businessCase?.financialImpact?.roi || 0}`);
        return findings;
      },
      recommendations: (score: RiskScore, context: RiskFactorContext) => {
        const recs = [];
        if (!context.businessCase?.needJustification) {
          recs.push('Document business necessity for services');
        }
        if (!context.businessCase?.strategicAlignment) {
          recs.push('Articulate strategic alignment of arrangement');
        }
        if (context.businessCase?.financialImpact?.roi < 1) {
          recs.push('Review financial impact and justify arrangement');
        }
        return recs;
      }
    },
    {
      id: 'benchmarking_justification',
      name: 'Benchmarking & Justification',
      description: 'Examining how compensation compares to industry benchmarks and justifying any deviations',
      thresholds: [
        { max: 1, points: 0, risk: 'low' },
        { max: 2, points: 1, risk: 'medium' },
        { max: 3, points: 2, risk: 'medium' },
        { max: 4, points: 3, risk: 'high' }
      ],
      evaluator: (context: RiskFactorContext): RiskScore => {
        let score = 0;
        const tccPercentile = context.compensation?.tccPercentile || 0;
        
        if (tccPercentile > 90) score += 2;
        else if (tccPercentile > 75) score += 1;
        
        const hasJustification = context.provider?.uniqueSkills?.length > 0 ||
                               context.provider?.specialCertifications?.length > 0 ||
                               context.market?.specialtyDemand === 'high';
                               
        if (tccPercentile > 75 && !hasJustification) score += 1;
        
        return Math.min(score, 3) as RiskScore;
      },
      findings: (context: RiskFactorContext) => {
        const findings = [];
        findings.push(`Compensation percentile: ${context.compensation?.tccPercentile}th`);
        if (context.provider?.uniqueSkills?.length > 0) {
          findings.push(`Unique skills: ${context.provider.uniqueSkills.join(', ')}`);
        }
        if (context.provider?.specialCertifications?.length > 0) {
          findings.push(`Special certifications: ${context.provider.specialCertifications.join(', ')}`);
        }
        findings.push(`Market demand: ${context.market?.specialtyDemand}`);
        return findings;
      },
      recommendations: (score: RiskScore, context: RiskFactorContext) => {
        const recs = [];
        if (score >= 2) {
          recs.push('Document specific factors justifying above-benchmark compensation');
          recs.push('Review and validate benchmark selection methodology');
        }
        if (context.compensation?.tccPercentile > 75 && !context.provider?.uniqueSkills?.length) {
          recs.push('Document unique qualifications or market conditions justifying compensation level');
        }
        return recs;
      }
    }
  ],
  riskLevels: [
    { max: 3, risk: 'low' as const },
    { max: 6, risk: 'medium' as const },
    { max: 12, risk: 'high' as const }
  ]
};

// Add RiskConfigContext
const RiskConfigContext = React.createContext<{
  config: RiskScoringConfig;
  updateConfig: (newConfig: RiskScoringConfig) => void;
}>({
  config: defaultRiskConfig,
  updateConfig: () => {}
});

// Add RiskConfigProvider component
const RiskConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<RiskScoringConfig>(defaultRiskConfig);

  const updateConfig = useCallback((newConfig: RiskScoringConfig) => {
    setConfig(newConfig);
  }, []);

  return (
    <RiskConfigContext.Provider value={{ config, updateConfig }}>
      {children}
    </RiskConfigContext.Provider>
  );
};

// Update RiskContextEditor component
const RiskContextEditor: React.FC<{
  context: RiskFactorContext;
  onUpdate: (context: RiskFactorContext) => void;
}> = ({ context, onUpdate }) => {
  const { config, updateConfig } = useContext(RiskConfigContext);
  
  return (
    <div className="space-y-6">
      {/* Market Context */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Market Context</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Specialty Demand</label>
            <select
              value={context.market.specialtyDemand}
              onChange={(e) => onUpdate({
                ...context,
                market: { ...context.market, specialtyDemand: e.target.value as 'low' | 'medium' | 'high' }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Market Competition</label>
            <select
              value={context.market.marketCompetition}
              onChange={(e) => onUpdate({
                ...context,
                market: { ...context.market, marketCompetition: e.target.value as 'low' | 'medium' | 'high' }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Geographic Region</label>
            <input
              type="text"
              value={context.market.geographicRegion}
              onChange={(e) => onUpdate({
                ...context,
                market: { ...context.market, geographicRegion: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Local Market Rate</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                value={context.market.localMarketRates}
                onChange={(e) => onUpdate({
                  ...context,
                  market: { ...context.market, localMarketRates: Number(e.target.value) }
                })}
                className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cost of Living Index</label>
            <input
              type="number"
              value={context.market.costOfLiving}
              onChange={(e) => onUpdate({
                ...context,
                market: { ...context.market, costOfLiving: Number(e.target.value) }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Provider Context */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Provider Context</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Years Experience</label>
            <input
              type="number"
              value={context.provider.yearsExperience}
              onChange={(e) => onUpdate({
                ...context,
                provider: { ...context.provider, yearsExperience: Number(e.target.value) }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Special Certifications</label>
            <input
              type="text"
              placeholder="Enter certifications (comma-separated)"
              value={context.provider.specialCertifications.join(', ')}
              onChange={(e) => onUpdate({
                ...context,
                provider: { 
                  ...context.provider, 
                  specialCertifications: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Academic Appointment</label>
            <input
              type="text"
              value={context.provider.academicAppointment || ''}
              onChange={(e) => onUpdate({
                ...context,
                provider: { ...context.provider, academicAppointment: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Unique Skills</label>
            <input
              type="text"
              placeholder="Enter skills (comma-separated)"
              value={context.provider.uniqueSkills.join(', ')}
              onChange={(e) => onUpdate({
                ...context,
                provider: { 
                  ...context.provider, 
                  uniqueSkills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Risk Scoring Configuration */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Scoring Configuration</h3>
        <div className="space-y-4">
          {config.categories.map(category => (
            <div key={category.id} className="border-b pb-4">
              <h4 className="font-medium text-gray-700">{category.name}</h4>
              <div className="mt-2 space-y-2">
                {category.thresholds.map((threshold, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-1">
                      <label className="text-sm text-gray-500">Max Value</label>
                      <input
                        type="number"
                        value={threshold.max}
                        onChange={(e) => {
                          const newConfig = { ...config };
                          newConfig.categories.find(c => c.id === category.id)!
                            .thresholds[index].max = Number(e.target.value);
                          updateConfig(newConfig);
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm text-gray-500">Points</label>
                      <input
                        type="number"
                        value={threshold.points}
                        onChange={(e) => {
                          const newConfig = { ...config };
                          newConfig.categories.find(c => c.id === category.id)!
                            .thresholds[index].points = Number(e.target.value);
                          updateConfig(newConfig);
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm text-gray-500">Risk Level</label>
                      <select
                        value={threshold.risk}
                        onChange={(e) => {
                          const newConfig = { ...config };
                          newConfig.categories.find(c => c.id === category.id)!
                            .thresholds[index].risk = e.target.value as 'low' | 'medium' | 'high';
                          updateConfig(newConfig);
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Update the main component to use RiskConfigProvider
const CompensationAnalysis: React.FC<CompensationAnalysisProps> = ({
  compensation: initialCompensation,
  benchmarks,
  onUpdate
}) => {
  const [compensation, setCompensation] = useState(initialCompensation);

  const handleUpdate = (updates: Partial<{
    total: number;
    wrvus: number;
    perWrvu: number;
    components: CompensationComponents;
  }>) => {
    const newCompensation = {
      ...compensation,
      total: updates.total || compensation.total,
      wrvus: updates.wrvus || compensation.wrvus,
      perWrvu: updates.perWrvu || compensation.perWrvu,
      components: updates.components || compensation.components
    };
    setCompensation(newCompensation);
    onUpdate(newCompensation);
  };

  return (
    <div className="space-y-6">
      <CompensationAnalysisContent 
        compensation={compensation}
        benchmarks={benchmarks}
        onUpdate={handleUpdate}
      />
    </div>
  );
};

// Move the main component content to a new component
const CompensationAnalysisContent: React.FC<CompensationAnalysisProps> = ({
  compensation,
  benchmarks: initialBenchmarks,
  onUpdate
}) => {
  // Validate and initialize benchmarks with default values
  const validateBenchmark = (b: any): Benchmark => ({
    percentile: b.percentile || '',
    tcc: Number(b.tcc) || 0,
    clinicalFte: Number(b.clinicalFte) || 0,
    wrvus: Number(b.wrvus) || 0,
    conversionFactor: Number(b.conversionFactor) || 0,
    callRate: Number(b.callRate) || 0,
    adminRate: Number(b.adminRate) || 0
  });

  // Initialize empty benchmarks
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);

  // Update benchmarks when initialBenchmarks prop changes
  useEffect(() => {
    if (initialBenchmarks && initialBenchmarks.length > 0) {
      setBenchmarks(initialBenchmarks.map(b => ({
        percentile: b.percentile,
        tcc: b.tcc || 0,
        wrvus: b.wrvus || 0,
        conversionFactor: b.conversionFactor || 0,
        clinicalFte: 1.0,
        callRate: 0,
        adminRate: 0
      })));
    }
  }, [initialBenchmarks]);

  const [isEditingBenchmarks, setIsEditingBenchmarks] = useState(false);
  const [isEditingComponents, setIsEditingComponents] = useState(false);
  
  // Initialize components with default values
  const initialComponents = {
    baseTotal: Number(compensation.components.baseTotal) || 0,
    productivityTotal: Number(compensation.components.productivityTotal) || 0,
    qualityTotal: Number(compensation.components.qualityTotal) || 0,
    adminTotal: Number(compensation.components.adminTotal) || 0,
    callTotal: Number(compensation.components.callTotal) || 0
  };

  const [components, setComponents] = useState<CompensationComponents>(initialComponents);

  // Update components when compensation changes
  useEffect(() => {
    setComponents({
      baseTotal: Number(compensation.components.baseTotal) || 0,
      productivityTotal: Number(compensation.components.productivityTotal) || 0,
      qualityTotal: Number(compensation.components.qualityTotal) || 0,
      adminTotal: Number(compensation.components.adminTotal) || 0,
      callTotal: Number(compensation.components.callTotal) || 0
    });
  }, [compensation.components]);

  const getPercentilePosition = (value: number, metric: keyof Benchmark) => {
    if (!benchmarks?.length) return 0;
    const benchmarkValues = benchmarks.map(b => Number(b[metric]));
    return calculatePercentile(value, benchmarkValues);
  };

  // Update the total display
  const totalCompensation = Object.values(components).reduce((sum, val) => sum + val, 0);

  // Update the percentile displays
  const tccPercentile = getPercentilePosition(totalCompensation, 'tcc');
  const wrvuPercentile = getPercentilePosition(compensation.wrvus, 'wrvus');
  const cfPercentile = getPercentilePosition(totalCompensation / (compensation.wrvus || 1), 'conversionFactor');

  const handleComponentChange = (field: keyof CompensationComponents, value: string) => {
    const numericValue = Number(value.replace(/[^0-9.-]+/g, ''));
    const newComponents = {
      ...components,
      [field]: numericValue
    };
    
    // Update local state
    setComponents(newComponents);

    // Calculate new total compensation
    const newTotal = Object.values(newComponents).reduce((sum, val) => sum + val, 0);

    // Calculate new per wRVU rate
    const newPerWrvu = compensation.wrvus > 0 ? newTotal / compensation.wrvus : 0;

    // Update parent component with new values
    onUpdate({
      total: newTotal,
      wrvus: compensation.wrvus,
      perWrvu: newPerWrvu,
      components: newComponents
    });
  };

  const [riskRules, setRiskRules] = useState<RiskScoreRule[]>([
    {
      id: 'productivity_alignment',
      name: 'Productivity Alignment',
      description: 'Adjust risk based on productivity vs compensation alignment',
      condition: 'wRVU percentile >= TCC percentile',
      score: -2,
      isEnabled: true
    },
    {
      id: 'experience_factor',
      name: 'Experience Factor',
      description: 'Adjust risk based on years of experience',
      condition: 'Years of experience > 10',
      score: -1,
      isEnabled: true
    }
  ]);

  const [riskAdjustments, setRiskAdjustments] = useState<RiskScoreAdjustment[]>([]);

  const handleRuleChange = (updatedRules: RiskScoreRule[]) => {
    setRiskRules(updatedRules);
  };

  const handleAdjustmentAdd = (adjustment: RiskScoreAdjustment) => {
    setRiskAdjustments(prev => [...prev, adjustment]);
  };

  const handleBenchmarkChange = (index: number, field: keyof Benchmark, value: string) => {
    const newBenchmarks = [...benchmarks];
    const numValue = parseFloat(value);
    
    if (!isNaN(numValue)) {
      newBenchmarks[index] = {
        ...newBenchmarks[index],
        [field]: numValue
      };
      setBenchmarks(newBenchmarks);
    }
  };

  const { config } = useContext(RiskConfigContext);
  
  const calculateRiskAnalysis = useMemo((): RiskAnalysis => {
    // Build the complete context object
    const context: RiskFactorContext = {
      market: {
        specialtyDemand: compensation.marketData?.specialtyDemand || 'medium',
        geographicRegion: compensation.marketData?.geographicRegion || '',
        marketCompetition: compensation.marketData?.marketCompetition || 'medium',
        localMarketRates: compensation.marketData?.localMarketRates || 0,
        recruitmentDifficulty: compensation.marketData?.recruitmentDifficulty || 'medium',
        costOfLiving: compensation.marketData?.costOfLiving || 100
      },
      provider: {
        yearsExperience: compensation.providerProfile?.yearsExperience || 0,
        specialCertifications: compensation.providerProfile?.specialCertifications || [],
        academicAppointment: compensation.providerProfile?.academicAppointment,
        uniqueSkills: compensation.providerProfile?.uniqueSkills || [],
        specialty: compensation.specialty,
        name: compensation.providerName
      },
      practice: {
        caseComplexity: 'medium',
        qualityMetrics: {
          type: compensation.qualityMetrics?.type || 'mixed',
          metrics: compensation.qualityMetrics?.metrics || [],
          score: compensation.qualityMetrics?.metrics.reduce((acc, m) => acc + m.actual, 0) || 0,
          benchmark: compensation.qualityMetrics?.metrics.reduce((acc, m) => acc + m.target, 0) || 0
        },
        patientSatisfaction: {
          score: 0,
          benchmark: 0
        },
        procedureMix: {
          highComplexity: 0,
          lowComplexity: 0
        }
      },
      program: {
        leadershipRole: compensation.documentation?.methodology.includes('leadership') ? 'Program Director' : undefined,
        researchActive: false,
        teachingResponsibilities: false,
        strategicImportance: 'medium'
      },
      compensation: {
        total: compensation.total,
        tccPercentile: getPercentilePosition(compensation.total, 'tcc'),
        wrvuPercentile: getPercentilePosition(compensation.wrvus, 'wrvus'),
        components: compensation.components
      },
      documentation: {
        methodology: compensation.documentation?.methodology || '',
        supportingDocs: compensation.documentation?.supportingDocs || [],
        lastReviewDate: compensation.documentation?.lastReviewDate || ''
      },
      compliance: {
        starkCompliance: compensation.compliance?.starkCompliance || false,
        aksPolicies: compensation.compliance?.aksPolicies || false,
        referralAnalysis: {
          hasReferralConnection: compensation.compliance?.referralAnalysis?.hasReferralConnection || false,
          referralImpact: compensation.compliance?.referralAnalysis?.referralImpact || 'none'
        }
      },
      businessCase: {
        needJustification: compensation.businessCase?.needJustification || '',
        strategicAlignment: compensation.businessCase?.strategicAlignment || '',
        financialImpact: {
          revenue: compensation.businessCase?.financialImpact?.revenue || 0,
          expenses: compensation.businessCase?.financialImpact?.expenses || 0,
          roi: compensation.businessCase?.financialImpact?.roi || 0
        }
      }
    };

    // Calculate risk factors using the configuration
    const factors = config.categories.map(category => {
      const value = category.evaluator(context);
      const threshold = category.thresholds.find(t => value <= t.max) || 
                       category.thresholds[category.thresholds.length - 1];
      
      return {
        category: category.name,
        score: threshold.points,
        riskLevel: threshold.risk,
        description: category.description,
        findings: category.findings(context),
        recommendations: category.recommendations(threshold.points, context)
      };
    });

    // Calculate total score and overall risk
    const totalScore = factors.reduce((sum, factor) => sum + factor.score, 0);
    const overallRisk = config.riskLevels.find(level => totalScore <= level.max)?.risk || 'high';

    // Create metrics array for RiskAnalysis interface
    const metrics: RiskMetric[] = factors.map(factor => ({
      name: factor.category,
      score: factor.score,
      description: factor.description,
      severity: factor.riskLevel === 'high' ? 'high' : 
                factor.riskLevel === 'medium' ? 'medium' : 'low',
      recommendations: factor.recommendations
    }));

    return {
      factors,
      totalScore,
      overallRisk,
      summary: `Total Risk Score: ${totalScore}/12 - ${overallRisk.charAt(0).toUpperCase() + overallRisk.slice(1)} Risk`,
      overallScore: totalScore,
      metrics,
      severity: totalScore >= 24 ? 'critical' : 
                totalScore >= 16 ? 'high' :
                totalScore >= 8 ? 'medium' : 'low',
      contextualFactors: context
    };
  }, [compensation, getPercentilePosition, config]);

  // Helper functions for contextual analysis
  const calculateMarketContextScore = (context: any) => {
    let score = 0;
    // Implementation based on market factors
    return score;
  };

  const calculateQualificationsScore = (qualifications: any) => {
    let score = 0;
    // Implementation based on provider qualifications
    return score;
  };

  const calculatePracticePatternScore = (metrics: any) => {
    let score = 0;
    // Implementation based on practice metrics
    return score;
  };

  const calculateProgramValueScore = (value: any) => {
    let score = 0;
    // Implementation based on program value
    return score;
  };

  const determineOverallSeverity = (totalScore: number, metrics: RiskMetric[]): 'low' | 'medium' | 'high' | 'critical' => {
    // Consider both score and context
    if (totalScore >= 9) return 'critical';
    if (totalScore >=6) return 'high';
    if (totalScore >=3) return 'medium';
    return 'low';
  };

  // Add to component state
  const [riskContext, setRiskContext] = useState<RiskFactorContext>({
    market: {
      specialtyDemand: compensation.marketData?.specialtyDemand || 'medium',
      geographicRegion: compensation.marketData?.geographicRegion || '',
      marketCompetition: compensation.marketData?.marketCompetition || 'medium',
      localMarketRates: compensation.marketData?.localMarketRates || 0,
      recruitmentDifficulty: 'medium',
      costOfLiving: 100
    },
    provider: compensation.providerProfile || {
      yearsExperience: 0,
      specialCertifications: [],
      uniqueSkills: []
    },
    practice: {
      caseComplexity: 'medium',
      qualityMetrics: {
        type: 'mixed',
        metrics: [],
        score: 0,
        benchmark: 0
      },
      patientSatisfaction: { score: 0, benchmark: 0 },
      procedureMix: { highComplexity: 0, lowComplexity: 0 }
    },
    program: {
      researchActive: false,
      teachingResponsibilities: false,
      strategicImportance: 'medium'
    }
  });

  return (
    <div className="space-y-8 font-inter">
      {/* Enterprise Dashboard Header */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="relative max-w-3xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-light text-gray-900 mb-3">
              {compensation.providerName || 'Provider'}
            </h1>
            
            <div className="mb-4">
              <div className="text-base text-gray-600">
                <span className="font-normal">{compensation.specialty || 'Not Specified'}</span>
              </div>
            </div>

            <div className="mt-4">
              <div className="inline-flex items-center justify-center space-x-3">
                <div className="h-[1px] w-12 bg-blue-200"></div>
                <span className="text-xs font-medium tracking-[0.2em] text-blue-600">FAIR MARKET VALUE ANALYSIS</span>
                <div className="h-[1px] w-12 bg-blue-200"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics - McKinsey Style */}
      <div className="grid grid-cols-3 gap-8 print:gap-6 print:mt-0 print:page-break-after-avoid">
        <div className="border rounded-lg p-6 bg-white">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Total Cash Compensation</h4>
          <div className="text-3xl font-light text-gray-900">${(compensation.total || 0).toLocaleString()}</div>
          <div className="text-sm text-blue-600 font-medium mt-2">
            {getPercentilePosition(compensation.total || 0, 'tcc').toFixed(1)}th percentile
          </div>
        </div>
        <div className="border rounded-lg p-6 bg-white">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Annual wRVUs</h4>
          <div className="text-3xl font-light text-gray-900">{(compensation.wrvus || 0).toLocaleString()}</div>
          <div className="text-sm text-green-600 font-medium mt-2">
            {getPercentilePosition(compensation.wrvus || 0, 'wrvus').toFixed(1)}th percentile
          </div>
        </div>
        <div className="border rounded-lg p-6 bg-white">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Conversion Factor</h4>
          <div className="text-3xl font-light text-gray-900">${(compensation.perWrvu || 0).toFixed(2)}</div>
          <div className="text-sm text-purple-600 font-medium mt-2">
            {getPercentilePosition(compensation.perWrvu || 0, 'conversionFactor').toFixed(1)}th percentile
          </div>
        </div>
      </div>

      {/* Compensation Components */}
      <Card title="Compensation Components" className="print:page-break-inside-avoid">
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setIsEditingComponents(!isEditingComponents)}
              className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-500 rounded-md border border-blue-200 hover:border-blue-300 transition-colors print:hidden"
            >
              {isEditingComponents ? 'Save' : 'Edit'}
            </button>
          </div>

          {/* First row - Base Salary, WRVU Incentive, Quality Payments */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Base Salary */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Base Salary</h3>
                  {isEditingComponents ? (
                    <div className="mt-0.5 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="text"
                        value={components.baseTotal.toLocaleString()}
                        onChange={(e) => handleComponentChange('baseTotal', e.target.value)}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-6 pr-3 py-0.5 sm:text-sm border-gray-300 rounded-md font-inter"
                      />
                    </div>
                  ) : (
                    <div className="mt-0.5 text-lg font-light text-gray-900">${components.baseTotal.toLocaleString()}</div>
                  )}
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* wRVU Incentive */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">wRVU Incentive</h3>
                  {isEditingComponents ? (
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="text"
                        value={components.productivityTotal.toLocaleString()}
                        onChange={(e) => handleComponentChange('productivityTotal', e.target.value)}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-6 pr-3 py-1 sm:text-sm border-gray-300 rounded-md font-inter"
                      />
                    </div>
                  ) : (
                    <div className="mt-0.5 text-xl font-light text-gray-900">${components.productivityTotal.toLocaleString()}</div>
                  )}
                </div>
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Quality */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Quality</h3>
                  {isEditingComponents ? (
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="text"
                        value={components.qualityTotal.toLocaleString()}
                        onChange={(e) => handleComponentChange('qualityTotal', e.target.value)}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-6 pr-3 py-1 sm:text-sm border-gray-300 rounded-md font-inter"
                      />
                    </div>
                  ) : (
                    <div className="mt-0.5 text-xl font-light text-gray-900">${components.qualityTotal.toLocaleString()}</div>
                  )}
                </div>
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Call Coverage */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Call Coverage</h3>
                  {isEditingComponents ? (
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="text"
                        value={components.callTotal.toLocaleString()}
                        onChange={(e) => handleComponentChange('callTotal', e.target.value)}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-6 pr-3 py-1 sm:text-sm border-gray-300 rounded-md font-inter"
                      />
                    </div>
                  ) : (
                    <div className="mt-0.5 text-xl font-light text-gray-900">${components.callTotal.toLocaleString()}</div>
                  )}
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Administrative */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Administrative</h3>
                  {isEditingComponents ? (
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="text"
                        value={components.adminTotal.toLocaleString()}
                        onChange={(e) => handleComponentChange('adminTotal', e.target.value)}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-6 pr-3 py-1 sm:text-sm border-gray-300 rounded-md font-inter"
                      />
                    </div>
                  ) : (
                    <div className="mt-0.5 text-xl font-light text-gray-900">${components.adminTotal.toLocaleString()}</div>
                  )}
                </div>
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* TCC (Total Cash Compensation) */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cash Compensation</h3>
                  <div className="mt-0.5 text-xl font-light text-gray-900">
                    ${Object.values(components).reduce((sum, val) => sum + val, 0).toLocaleString()}
                  </div>
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Market Position Analysis */}
      <Card title="Market Analysis">
        <div className="space-y-8">
          {/* Market Position Visualization */}
          <div>
            <h2 className="text-xl font-light text-gray-900 mb-6">Market Position</h2>
            <div className="space-y-8">
              {/* Total Cash Position */}
              <div>
                <div className="flex justify-between mb-3">
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Cash Compensation</span>
                  <span className="text-sm font-medium text-blue-600">
                    {getPercentilePosition(compensation.total, 'tcc').toFixed(1)}th percentile
                  </span>
                </div>
                <div className="relative">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-100">
                    <div
                      style={{ width: `${getPercentilePosition(compensation.total, 'tcc')}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                    />
                  </div>
                  {/* Tick marks */}
                  <div className="absolute top-0 w-full">
                    <div className="relative h-2">
                      <div style={{ left: '0%' }} className="absolute w-0.5 h-2 bg-gray-300" />
                      <div style={{ left: '20%' }} className="absolute w-0.5 h-2 bg-gray-300" />
                      <div style={{ left: '40%' }} className="absolute w-0.5 h-2 bg-gray-300" />
                      <div style={{ left: '60%' }} className="absolute w-0.5 h-2 bg-gray-300" />
                      <div style={{ left: '80%' }} className="absolute w-0.5 h-2 bg-gray-300" />
                      <div style={{ left: '100%' }} className="absolute w-0.5 h-2 bg-gray-300" />
                    </div>
                  </div>
                  {/* Percentile labels */}
                  <div className="relative w-full mt-1">
                    <div style={{ left: '0%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400">0</div>
                    <div style={{ left: '20%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400">20th</div>
                    <div style={{ left: '40%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400">40th</div>
                    <div style={{ left: '60%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400">60th</div>
                    <div style={{ left: '80%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400">80th</div>
                    <div style={{ left: '100%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400">100th</div>
                  </div>
                </div>
              </div>

              {/* wRVUs Position */}
              <div>
                <div className="flex justify-between mb-3">
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Annual wRVUs</span>
                  <span className="text-sm font-medium text-green-600">
                    {getPercentilePosition(compensation.wrvus, 'wrvus').toFixed(1)}th percentile
                  </span>
                </div>
                <div className="relative">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-green-100">
                    <div
                      style={{ width: `${getPercentilePosition(compensation.wrvus, 'wrvus')}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                    />
                  </div>
                  {/* Tick marks */}
                  <div className="absolute top-0 w-full">
                    <div className="relative h-2">
                      <div style={{ left: '0%' }} className="absolute w-0.5 h-2 bg-gray-300" />
                      <div style={{ left: '20%' }} className="absolute w-0.5 h-2 bg-gray-300" />
                      <div style={{ left: '40%' }} className="absolute w-0.5 h-2 bg-gray-300" />
                      <div style={{ left: '60%' }} className="absolute w-0.5 h-2 bg-gray-300" />
                      <div style={{ left: '80%' }} className="absolute w-0.5 h-2 bg-gray-300" />
                      <div style={{ left: '100%' }} className="absolute w-0.5 h-2 bg-gray-300" />
                    </div>
                  </div>
                  {/* Percentile labels */}
                  <div className="relative w-full mt-1">
                    <div style={{ left: '0%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400">0</div>
                    <div style={{ left: '20%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400">20th</div>
                    <div style={{ left: '40%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400">40th</div>
                    <div style={{ left: '60%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400">60th</div>
                    <div style={{ left: '80%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400">80th</div>
                    <div style={{ left: '100%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400">100th</div>
                  </div>
                </div>
              </div>

              {/* Conversion Factor Position */}
              <div>
                <div className="flex justify-between mb-3">
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Conversion Factor</span>
                  <span className="text-sm font-medium text-purple-600">
                    {getPercentilePosition(compensation.perWrvu, 'conversionFactor').toFixed(1)}th percentile
                  </span>
                </div>
                <div className="relative">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-purple-100">
                    <div
                      style={{ width: `${getPercentilePosition(compensation.perWrvu, 'conversionFactor')}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"
                    />
                  </div>
                  {/* Tick marks */}
                  <div className="absolute top-0 w-full">
                    <div className="relative h-2">
                      <div style={{ left: '0%' }} className="absolute w-0.5 h-2 bg-gray-300" />
                      <div style={{ left: '20%' }} className="absolute w-0.5 h-2 bg-gray-300" />
                      <div style={{ left: '40%' }} className="absolute w-0.5 h-2 bg-gray-300" />
                      <div style={{ left: '60%' }} className="absolute w-0.5 h-2 bg-gray-300" />
                      <div style={{ left: '80%' }} className="absolute w-0.5 h-2 bg-gray-300" />
                      <div style={{ left: '100%' }} className="absolute w-0.5 h-2 bg-gray-300" />
                    </div>
                  </div>
                  {/* Percentile labels */}
                  <div className="relative w-full mt-1">
                    <div style={{ left: '0%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400">0</div>
                    <div style={{ left: '20%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400">20th</div>
                    <div style={{ left: '40%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400">40th</div>
                    <div style={{ left: '60%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400">60th</div>
                    <div style={{ left: '80%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400">80th</div>
                    <div style={{ left: '100%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400">100th</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Market Benchmarks Table */}
          <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-light text-gray-900">Market Benchmarks</h2>
              <button
                onClick={() => setIsEditingBenchmarks(!isEditingBenchmarks)}
                className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-500 rounded-md border border-blue-200 hover:border-blue-300 transition-colors print:hidden"
              >
                {isEditingBenchmarks ? 'Save' : 'Edit'}
              </button>
            </div>
            <div className="overflow-hidden border rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 font-inter text-sm">
                <thead className="bg-gray-50 print:bg-gray-100">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Metric
                    </th>
                    {benchmarks.map(b => (
                      <th key={b.percentile} scope="col" className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {b.percentile}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      Total Cash Compensation
                    </td>
                    {benchmarks
                      .slice()
                      .map((b, index) => (
                        <td key={b.percentile} className="px-2 py-2 whitespace-nowrap text-sm text-right">
                          {isEditingBenchmarks ? (
                            <input
                              type="text"
                              value={(b.tcc || 0).toLocaleString()}
                              onChange={(e) => handleBenchmarkChange(index, 'tcc', e.target.value.replace(/,/g, ''))}
                              className="w-24 text-right border rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500 text-sm font-inter"
                            />
                          ) : (
                            <span className="font-medium text-gray-900">${(b.tcc || 0).toLocaleString()}</span>
                          )}
                        </td>
                      ))}
                  </tr>
                  <tr>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      Annual wRVUs
                    </td>
                    {benchmarks
                      .slice()
                      .map((b, index) => (
                        <td key={b.percentile} className="px-2 py-2 whitespace-nowrap text-sm text-right">
                          {isEditingBenchmarks ? (
                            <input
                              type="text"
                              value={(b.wrvus || 0).toLocaleString()}
                              onChange={(e) => handleBenchmarkChange(index, 'wrvus', e.target.value.replace(/,/g, ''))}
                              className="w-20 text-right border rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500 text-sm font-inter"
                            />
                          ) : (
                            <span className="font-medium text-gray-900">{(b.wrvus || 0).toLocaleString()}</span>
                          )}
                        </td>
                      ))}
                  </tr>
                  <tr>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      Conversion Factor
                    </td>
                    {benchmarks
                      .slice()
                      .map((b, index) => (
                        <td key={b.percentile} className="px-2 py-2 whitespace-nowrap text-sm text-right">
                          {isEditingBenchmarks ? (
                            <div className="relative inline-block">
                              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">$</span>
                              </div>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={b.conversionFactor || 0}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                                    handleBenchmarkChange(index, 'conversionFactor', value);
                                  }
                                }}
                                className="w-20 text-right pl-6 border rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500 text-sm font-inter"
                              />
                            </div>
                          ) : (
                            <span className="font-medium text-gray-900">${(b.conversionFactor || 0).toFixed(2)}</span>
                          )}
                        </td>
                      ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>

      {/* Risk Analysis Section */}
      <Card title="Risk Analysis" className="print:page-break-inside-avoid">
        <RiskAnalysisSection 
          analysis={calculateRiskAnalysis} 
          riskRules={riskRules}
          setRiskRules={setRiskRules}
          context={riskContext}
          onContextUpdate={setRiskContext}
          onRuleChange={handleRuleChange}
          onAdjustmentAdd={handleAdjustmentAdd}
        />
      </Card>
    </div>
  );
};

// Add RiskFactorEditor component
const RiskFactorEditor: React.FC<RiskFactorEditorProps> = ({ context, onContextChange }) => {
  const [selectedScore, setSelectedScore] = useState<0 | 1 | 2 | 3>(context.practice.qualityMetrics.type === 'objective' ? 0 : context.practice.qualityMetrics.type === 'subjective' ? 1 : 2);
  const [editedFindings, setEditedFindings] = useState<string[]>(context.practice.qualityMetrics.metrics.map(m => m.name));
  const [editedRecommendations, setEditedRecommendations] = useState<string[]>(context.practice.qualityMetrics.metrics.map(m => m.name));

  const handleSave = () => {
    onContextChange({
      ...context,
      practice: {
        ...context.practice,
        qualityMetrics: {
          ...context.practice.qualityMetrics,
          type: selectedScore === 0 ? 'objective' : selectedScore === 1 ? 'subjective' : 'mixed',
          metrics: context.practice.qualityMetrics.metrics.map(m => ({
            ...m,
            actual: selectedScore === 0 ? m.target : selectedScore === 1 ? m.actual : m.actual
          }))
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border max-w-lg shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">{context.practice.qualityMetrics.type === 'objective' ? 'Objective' : context.practice.qualityMetrics.type === 'subjective' ? 'Subjective' : 'Mixed'} Quality Metrics</h3>
          <button onClick={() => onContextChange(context)} className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Risk Score Selection */}
          <div className="border rounded-lg p-4">
            <Title level={5}>Risk Assessment</Title>
            <div className="grid grid-cols-2 gap-3 mt-3">
              {options.map((option) => (
                <div
                  key={option.score}
                  className={`p-3 border rounded-lg cursor-pointer flex items-center ${
                    selectedScore === option.score ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedScore(option.score)}
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                  <input
                    type="radio"
                    checked={selectedScore === option.score}
                    onChange={() => setSelectedScore(option.score)}
                    className="ml-2"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Findings */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">Findings</h4>
            <div className="space-y-2">
              {editedFindings.map((finding, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={finding}
                    onChange={(e) => {
                      const newFindings = [...editedFindings];
                      newFindings[index] = e.target.value;
                      setEditedFindings(newFindings);
                    }}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      const newFindings = editedFindings.filter((_, i) => i !== index);
                      setEditedFindings(newFindings);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                onClick={() => setEditedFindings([...editedFindings, ''])}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Add Finding
              </button>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">Recommendations</h4>
            <div className="space-y-2">
              {editedRecommendations.map((recommendation, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={recommendation}
                    onChange={(e) => {
                      const newRecommendations = [...editedRecommendations];
                      newRecommendations[index] = e.target.value;
                      setEditedRecommendations(newRecommendations);
                    }}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      const newRecommendations = editedRecommendations.filter((_, i) => i !== index);
                      setEditedRecommendations(newRecommendations);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                onClick={() => setEditedRecommendations([...editedRecommendations, ''])}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Add Recommendation
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => onContextChange(context)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Update RiskAnalysisSection to handle the updated editor
const RiskAnalysisSection: React.FC<{
  analysis: RiskAnalysis;
  riskRules: RiskScoreRule[];
  setRiskRules: (rules: RiskScoreRule[]) => void;
  context: RiskFactorContext;
  onContextUpdate: (context: RiskFactorContext) => void;
  onRuleChange: (ruleId: string, updates: Partial<RiskScoreRule>) => void;
  onAdjustmentAdd: (adjustment: RiskScoreAdjustment) => void;
}> = ({ analysis, riskRules, setRiskRules, context, onContextUpdate, onRuleChange, onAdjustmentAdd }) => {
   const [factors, setFactors] = useState<RiskFactor[]>([
    {
      category: 'Compensation Structure',
      score: 0 as RiskScore,
      riskLevel: 'low' as RiskLevel,
      description: 'Assessment of compensation consistency with market value considering specialty, experience, location, and demand',
      findings: [],
      recommendations: []
    },
    {
      category: 'Regulatory Compliance',
      score: 0 as RiskScore,
      riskLevel: 'low' as RiskLevel,
      description: 'Ensuring adherence to federal regulations like the Stark Law and Anti-Kickback Statute',
      findings: [],
      recommendations: []
    },
    {
      category: 'Commercial Reasonableness',
      score: 0 as RiskScore,
      riskLevel: 'low' as RiskLevel,
      description: 'Evaluating if the arrangement makes sense from a business perspective, independent of potential referrals',
      findings: [],
      recommendations: []
    },
    {
      category: 'Benchmarking & Justification',
      score: 0 as RiskScore,
      riskLevel: 'low' as RiskLevel,
      description: 'Examining how compensation compares to industry benchmarks and justifying any deviations',
      findings: [],
      recommendations: []
    }
  ]);

  const [selectedFactor, setSelectedFactor] = useState<RiskFactor | null>(null);
  const [totalScore, setTotalScore] = useState(analysis.totalScore);

  // Calculate risk level based on total score
  const calculateRiskLevel = (score: number): 'low' | 'medium' | 'high' | 'critical' => {
    if (score >= 9) return 'critical';
    if (score >= 6) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
  };

  // Update total score whenever factors change
  useEffect(() => {
    const newTotalScore = factors.reduce((sum, factor) => sum + factor.score, 0);
    setTotalScore(newTotalScore);
  }, [factors]);

  const handleFactorUpdate = (factor: RiskFactor, updates: { score: RiskScore; findings: string[]; recommendations: string[] }) => {
    const updatedFactors = factors.map(f => 
      f.category === factor.category
        ? {
            ...f,
            ...updates,
            riskLevel: updates.score === 0 ? ('low' as RiskLevel) : 
                       updates.score === 1 ? ('medium' as RiskLevel) : 
                       ('high' as RiskLevel)
          }
        : f
    );
    setFactors(updatedFactors);
    setSelectedFactor(null);
  };

  const renderFactorContent = (factor: RiskFactor) => {
    const riskLevelClass = factor.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
      factor.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
      'bg-green-100 text-green-800';

    return (
      <div 
        className="cursor-pointer group hover:bg-gray-50 transition-colors duration-150"
        onClick={() => setSelectedFactor(factor)}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">{factor.category}</h3>
            <p className="text-sm text-gray-600">{factor.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`px-2 py-1 rounded-full text-sm font-medium ${riskLevelClass}`}>
              {factor.score} Points
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Findings:</h4>
            <ul className="mt-1 list-disc list-inside text-sm text-gray-600">
              {factor.findings.map((finding, i) => (
                <li key={i}>{finding}</li>
              ))}
            </ul>
          </div>
          {factor.recommendations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900">Recommendations:</h4>
              <ul className="mt-1 list-disc list-inside text-sm text-gray-600">
                {factor.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-light text-gray-900">FMV Risk Analysis</h2>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          calculateRiskLevel(totalScore) === 'critical' ? 'bg-red-100 text-red-800' :
          calculateRiskLevel(totalScore) === 'high' ? 'bg-orange-100 text-orange-800' :
          calculateRiskLevel(totalScore) === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {calculateRiskLevel(totalScore).charAt(0).toUpperCase() + calculateRiskLevel(totalScore).slice(1)} Risk
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {factors.map(factor => (
          <div 
            key={factor.category} 
            className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-150 hover:border-blue-200"
          >
            {renderFactorContent(factor)}
          </div>
        ))}
      </div>

      {selectedFactor && (
        <RiskModal
          isOpen={true}
          title={selectedFactor.category}
          description={selectedFactor.description}
          findings={selectedFactor.findings}
          recommendations={selectedFactor.recommendations}
          score={selectedFactor.score}
          onUpdate={(updates) => handleFactorUpdate(selectedFactor, updates)}
          onClose={() => setSelectedFactor(null)}
          riskOptions={defaultRiskOptions}
        />
      )}

      <div className="border-t pt-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Overall Assessment</h3>
            <p className="text-sm text-gray-600">Based on comprehensive analysis of all risk factors</p>
          </div>
          <div className="text-2xl font-light text-gray-900">
            {totalScore} / 12
          </div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-4">
          <div className={`p-3 rounded-lg border ${
            calculateRiskLevel(totalScore) === 'low' ? 'bg-green-50 border-green-200 ring-2 ring-green-500' : 'bg-green-50 border-green-200'
          }`}>
            <div className="text-sm font-medium text-green-800">Low Risk (0-3)</div>
            <div className="text-xs text-green-600">Aligned with market standards</div>
          </div>
          <div className={`p-3 rounded-lg border ${
            calculateRiskLevel(totalScore) === 'medium' ? 'bg-yellow-50 border-yellow-200 ring-2 ring-yellow-500' : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="text-sm font-medium text-yellow-800">Medium Risk (4-6)</div>
            <div className="text-xs text-yellow-600">Additional documentation needed</div>
          </div>
          <div className={`p-3 rounded-lg border ${
            calculateRiskLevel(totalScore) === 'high' ? 'bg-orange-50 border-orange-200 ring-2 ring-orange-500' : 'bg-orange-50 border-orange-200'
          }`}>
            <div className="text-sm font-medium text-orange-800">High Risk (7-9)</div>
            <div className="text-xs text-orange-600">Requires thorough justification</div>
          </div>
          <div className={`p-3 rounded-lg border ${
            calculateRiskLevel(totalScore) === 'critical' ? 'bg-red-50 border-red-200 ring-2 ring-red-500' : 'bg-red-50 border-red-200'
          }`}>
            <div className="text-sm font-medium text-red-800">Critical Risk (10-12)</div>
            <div className="text-xs text-red-600">Immediate review required</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add RiskOption interface
interface RiskOption {
  score: RiskScore;
  label: string;
  description: string;
}

// Add riskOptions definition
const riskOptions: Record<string, RiskOption[]> = {
  'Clinical Compensation Risk': [
    { 
      score: 0, 
      label: 'Low Risk', 
      description: 'Compensation below 50th percentile with matching productivity'
    },
    { 
      score: 1, 
      label: 'Medium-Low Risk', 
      description: '50th-75th percentile with supporting productivity'
    },
    { 
      score: 2, 
      label: 'Medium Risk', 
      description: '75th-90th percentile or misaligned productivity'
    },
    { 
      score: 3, 
      label: 'High Risk', 
      description: 'Above 90th percentile or significantly misaligned productivity'
    }
  ],
  'Market Factors Risk': [
    {
      score: 0,
      label: 'Low Risk',
      description: 'Low demand specialty, low competition'
    },
    {
      score: 1,
      label: 'Low-Medium Risk',
      description: 'Medium demand or moderate competition'
    },
    {
      score: 2,
      label: 'Medium Risk',
      description: 'High demand or high competition'
    },
    {
      score: 3,
      label: 'High Risk',
      description: 'High demand with high competition'
    }
  ],
  'Documentation Risk': [
    {
      score: 0,
      label: 'Low Risk',
      description: 'Complete documentation with recent review'
    },
    {
      score: 1,
      label: 'Low-Medium Risk',
      description: 'Minor gaps in documentation'
    },
    {
      score: 2,
      label: 'Medium Risk',
      description: 'Significant documentation gaps'
    },
    {
      score: 3,
      label: 'High Risk',
      description: 'Major documentation deficiencies'
    }
  ],
  'Structural Risk': [
    {
      score: 0,
      label: 'Low Risk',
      description: 'Balanced compensation structure with appropriate incentives'
    },
    {
      score: 1,
      label: 'Low-Medium Risk',
      description: 'Mostly balanced with minor concerns'
    },
    {
      score: 2,
      label: 'Medium Risk',
      description: 'Imbalanced structure or misaligned incentives'
    },
    {
      score: 3,
      label: 'High Risk',
      description: 'Highly imbalanced or inappropriate structure'
    }
  ]
};

interface RiskModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  findings?: string[];
  recommendations?: string[];
  score?: RiskScore;
  onUpdate: (data: { score: RiskScore; findings: string[]; recommendations: string[] }) => void;
  riskOptions?: RiskOption[];
}

const defaultRiskOptions: RiskOption[] = [
  {
    score: 0,
    label: 'Low Risk',
    description: 'Minimal risk factors identified, well within normal ranges'
  },
  {
    score: 1,
    label: 'Medium-Low Risk',
    description: 'Some minor risk factors, but generally acceptable'
  },
  {
    score: 2,
    label: 'Medium-High Risk',
    description: 'Multiple risk factors requiring attention'
  },
  {
    score: 3,
    label: 'High Risk',
    description: 'Significant risk factors requiring immediate attention'
  }
];

const RiskModal: React.FC<RiskModalProps> = ({ 
  isOpen, 
  onClose, 
  title,
  description,
  findings = [], 
  recommendations = [], 
  score = 0,
  onUpdate,
  riskOptions = defaultRiskOptions
}) => {
  const [selectedScore, setSelectedScore] = useState<RiskScore>(score);
  const [editedFindings, setEditedFindings] = useState<string[]>(findings);
  const [editedRecommendations, setEditedRecommendations] = useState<string[]>(recommendations);
  const options = riskOptions || defaultRiskOptions;

  const handleSave = () => {
    onUpdate({
      score: selectedScore,
      findings: editedFindings,
      recommendations: editedRecommendations
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border max-w-lg shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <Title level={4}>{title}</Title>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Risk Score Selection */}
          <div className="border rounded-lg p-4">
            <Title level={5}>Risk Assessment</Title>
            <div className="grid grid-cols-2 gap-3 mt-3">
              {options.map((option) => (
                <div
                  key={option.score}
                  className={`p-3 border rounded-lg cursor-pointer flex items-center ${
                    selectedScore === option.score ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedScore(option.score)}
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                  <input
                    type="radio"
                    checked={selectedScore === option.score}
                    onChange={() => setSelectedScore(option.score)}
                    className="ml-2"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Findings */}
          <div>
            <Title level={5}>Findings</Title>
            <div className="space-y-2">
              {editedFindings.map((finding: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={finding}
                    onChange={(e) => {
                      const newFindings = [...editedFindings];
                      newFindings[index] = e.target.value;
                      setEditedFindings(newFindings);
                    }}
                    className="flex-1 rounded-md border-gray-300"
                  />
                  <button
                    onClick={() => {
                      const newFindings = editedFindings.filter((_: string, i: number) => i !== index);
                      setEditedFindings(newFindings);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                onClick={() => setEditedFindings([...editedFindings, ''])}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Add Finding
              </button>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <Title level={5}>Recommendations</Title>
            <div className="space-y-2">
              {editedRecommendations.map((rec: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={rec}
                    onChange={(e) => {
                      const newRecs = [...editedRecommendations];
                      newRecs[index] = e.target.value;
                      setEditedRecommendations(newRecs);
                    }}
                    className="flex-1 rounded-md border-gray-300"
                  />
                  <button
                    onClick={() => {
                      const newRecs = editedRecommendations.filter((_: string, i: number) => i !== index);
                      setEditedRecommendations(newRecs);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                onClick={() => setEditedRecommendations([...editedRecommendations, ''])}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Add Recommendation
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

type ReferralImpact = 'none' | 'low' | 'medium' | 'high';

interface RiskFactorEditorProps {
  context: RiskFactorContext;
  onContextChange: (context: RiskFactorContext) => void;
}

const handleRiskFactorUpdate = (
  updatedContext: RiskFactorContext,
  score: number,
  findings: string[],
  recommendations: string[]
): void => {
  // Implementation
};

const handleRuleUpdate = (ruleId: string, updates: Partial<RiskScoreRule>): void => {
  // Implementation
};

const updateRiskFactors = (factors: RiskFactor[]): void => {
  setRiskFactors(factors.map(factor => ({
    ...factor,
    riskLevel: factor.riskLevel as 'low' | 'medium' | 'high'
  })));
};

export default CompensationAnalysis; 