export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ComplianceStatus = 'compliant' | 'non-compliant' | 'pending';
export type JustificationStatus = 'complete' | 'incomplete' | 'pending';
export type PracticeType = 'academic' | 'private' | 'hospital-employed';
export type GeographicSetting = 'urban' | 'suburban' | 'rural';
export type RiskScore = 0 | 1 | 2 | 3;
export type ReferralImpact = 'none' | 'low' | 'medium' | 'high';

export interface CompensationFactors {
  totalCompensationPercentile: number;
  experienceLevel: string;
  benchmarkComparison: number;
  justificationStatus: JustificationStatus;
}

export interface MarketFactors {
  specialtyDemand: RiskLevel;
  marketPosition: string;
  specialtyFactors: string[];
  geographicFactors: {
    region: string;
    setting: GeographicSetting;
    costOfLiving: number;
  };
}

export interface ComplianceFactors {
  starkLaw: {
    status: ComplianceStatus;
    details: string;
  };
  antiKickback: {
    status: ComplianceStatus;
    details: string;
  };
}

export interface DocumentationFactors {
  businessCase: string[];
  strategicAlignment: string[];
  supportingDocuments: {
    [key: string]: boolean;
  };
}

export interface CompensationAnalysis {
  factors: CompensationFactors;
  findings: string[];
  recommendations: string[];
}

export interface MarketAnalysis {
  factors: MarketFactors;
  findings: string[];
  recommendations: string[];
}

export interface ComplianceAnalysis {
  factors: ComplianceFactors;
  findings: string[];
  recommendations: string[];
}

export interface DocumentationAnalysis {
  factors: DocumentationFactors;
  score: RiskScore;
  findings: string[];
  recommendations: string[];
}

export interface ReviewEntry {
  date: string;
  reviewer: string;
  changes: string[];
  notes?: string;
}

export interface RiskFactor {
  category: string;
  score: RiskScore;
  riskLevel: RiskLevel;
  description: string;
  findings: string[];
  recommendations: string[];
}

export interface RiskFactorContext {
  compensation?: {
    tccPercentile: number;
    components: {
      baseTotal?: number;
      productivityTotal?: number;
      callTotal?: number;
      adminTotal?: number;
    };
  };
  market?: {
    specialtyDemand: RiskLevel;
    geographicRegion: string;
    costOfLiving: number;
  };
  provider?: {
    yearsExperience: number;
    specialCertifications?: string[];
    uniqueSkills?: string[];
  };
  compliance?: {
    starkCompliance: boolean;
    aksPolicies: boolean;
    referralAnalysis?: {
      hasReferralConnection: boolean;
      referralImpact: ReferralImpact;
    };
  };
  documentation?: {
    methodology?: string;
    supportingDocs?: string[];
    lastReviewDate?: string;
  };
  businessCase?: {
    needJustification?: string;
    strategicAlignment?: string;
    financialImpact?: {
      roi: number;
    };
  };
}

export interface FMVRiskAnalysis {
  analysisDate: string;
  analyst: string;
  overallRisk: RiskLevel;
  compensationAnalysis: CompensationAnalysis;
  marketAnalysis: MarketAnalysis;
  complianceAnalysis: ComplianceAnalysis;
  documentationAnalysis: DocumentationAnalysis;
  summary: string;
  reviewHistory: ReviewEntry[];
} 