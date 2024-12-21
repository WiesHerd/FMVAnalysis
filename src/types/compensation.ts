export interface CompensationComponents {
  baseTotal: number;
  productivityTotal: number;
  callTotal: number;
  adminTotal: number;
  qualityTotal: number;
}

export interface RiskMetric {
  name: string;
  score: number;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

export interface RiskFactor {
  category: string;
  description: string;
  score: 0 | 1 | 2 | 3;
  findings: string[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface RiskAnalysis {
  factors: RiskFactor[];
  totalScore: number;
  overallRisk: 'low' | 'medium' | 'high';
  summary: string;
  overallScore: number;
  metrics: RiskMetric[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  contextualFactors: {
    market: {
      geographicRegion: string;
      marketCompetition: 'low' | 'medium' | 'high';
      recruitmentDifficulty: 'low' | 'medium' | 'high';
      costOfLiving: number;
    };
    provider: {
      yearsExperience: number;
      specialCertifications: string[];
      academicAppointment?: string;
      uniqueSkills: string[];
    };
    practice: {
      caseComplexity: 'low' | 'medium' | 'high';
      qualityMetrics: {
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
      leadershipRole?: string;
      researchActive: boolean;
      teachingResponsibilities: boolean;
      strategicImportance: 'low' | 'medium' | 'high';
    };
  };
} 