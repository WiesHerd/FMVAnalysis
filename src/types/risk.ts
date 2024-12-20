export type RiskScore = 0 | 1 | 2 | 3;
export type RiskLevel = 'low' | 'medium' | 'high';
export type ReferralImpact = 'none' | 'indirect' | 'direct';

export interface RiskFactor {
  category: string;
  score: RiskScore;
  riskLevel: RiskLevel;
  description: string;
  findings: string[];
  recommendations: string[];
}

export interface RiskAnalysis {
  riskFactors: RiskFactor[];
  totalScore: number;
  overallRiskLevel: RiskLevel;
  contextualFactors: RiskFactorContext;
}

export interface RiskFactorContext {
  market: {
    specialtyDemand: RiskLevel;
    geographicRegion: string;
    marketCompetition: RiskLevel;
    localMarketRates: number;
    recruitmentDifficulty: RiskLevel;
    costOfLiving: number;
  };
  provider: {
    experience: number;
    productivity: number;
    quality: number;
    referralImpact: ReferralImpact;
  };
  practice: {
    size: number;
    patientVolume: number;
    payerMix: number;
    overhead: number;
  };
  program: {
    strategicValue: RiskLevel;
    financialPerformance: number;
    compliance: number;
    documentation: number;
  };
  compensation: {
    baseAmount: number;
    incentiveStructure: string;
    benefits: string[];
  };
  documentation: {
    completeness: number;
    accuracy: number;
    timeliness: number;
  };
  compliance: {
    programRequirements: number;
    regulatoryStandards: number;
    internalPolicies: number;
  };
  businessCase: {
    roi: number;
    marketShare: number;
    revenueGrowth: number;
  };
}

export interface RiskScoreRule {
  id: string;
  category: string;
  condition: string;
  score: RiskScore;
  description: string;
}

export type RiskScoreRuleUpdate = Partial<RiskScoreRule>; 