export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ComplianceStatus = 'compliant' | 'partial' | 'non-compliant' | 'needs-review';

export interface FMVRiskFactor {
  category: string;
  description: string;
  score: number;
  findings: string[];
  recommendations: string[];
  riskLevel: RiskLevel;
  lastUpdated: string;
  updatedBy: string;
}

export interface CompensationRiskAnalysis {
  category: 'compensation';
  factors: {
    totalCompensationPercentile: number;
    productivityPercentile: number;
    productivityCompensationAlignment: number;
    baseCompensationRatio: number;
    callCoverageAlignment: number;
    subspecialtyImpact: number;
    geographicAdjustment: number;
  };
  benchmarkSources: {
    name: string;
    year: string;
    percentile: number;
  }[];
  findings: string[];
  recommendations: string[];
}

export interface MarketRiskAnalysis {
  category: 'market';
  factors: {
    specialtyDemand: RiskLevel;
    payorMix: number;
    competitionLevel: RiskLevel;
    physicianShortage: boolean;
    geographicFactors: {
      region: string;
      setting: 'urban' | 'suburban' | 'rural';
      costOfLiving: number;
    };
    practiceType: 'academic' | 'private' | 'hospital-employed';
  };
  findings: string[];
  recommendations: string[];
}

export interface DocumentationRiskAnalysis {
  category: 'documentation';
  factors: {
    fmvElements: {
      marketDataSources: boolean;
      compensationApproach: boolean;
      benchmarkSelection: boolean;
      productivityMetrics: boolean;
      specialtyConsiderations: boolean;
      geographicAdjustments: boolean;
      qualityMetrics: boolean;
      callCoverage: boolean;
      administrativeDuties: boolean;
      complianceConsiderations: boolean;
    };
    supportingDocuments: {
      marketSurveyData: boolean;
      benchmarkAnalysis: boolean;
      productivityData: boolean;
      compensationModel: boolean;
      complianceChecklist: boolean;
    };
    lastReviewDate: string;
  };
  findings: [string, string?, string?, string?, string?];
  recommendations: [string, string?, string?, string?, string?];
  score: number;
}

export interface ComplianceRiskAnalysis {
  category: 'compliance';
  factors: {
    starkLaw: {
      status: ComplianceStatus;
      issues: string[];
    };
    antiKickback: {
      status: ComplianceStatus;
      issues: string[];
    };
    commercialReasonableness: {
      status: ComplianceStatus;
      issues: string[];
    };
  };
  findings: string[];
  recommendations: string[];
}

export interface FMVRiskAnalysis {
  providerId: string;
  providerName: string;
  specialty: string;
  analysisDate: string;
  analyst: string;
  overallRisk: RiskLevel;
  compensationAnalysis: CompensationRiskAnalysis;
  marketAnalysis: MarketRiskAnalysis;
  documentationAnalysis: DocumentationRiskAnalysis;
  complianceAnalysis: ComplianceRiskAnalysis;
  summary: string;
  reviewHistory: Array<{
    date: string;
    reviewer: string;
    changes: string[];
    notes: string;
  }>;
} 