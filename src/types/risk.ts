export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type RiskScore = 0 | 1 | 2 | 3;

export interface RiskFactor {
  category: string;
  score: RiskScore;
  riskLevel: RiskLevel;
  description: string;
  findings: string[];
  recommendations: string[];
}

export interface RiskFactorContext {
  factors: RiskFactor[];
  selectedFactor: RiskFactor | null;
  setSelectedFactor: (factor: RiskFactor | null) => void;
  handleFactorUpdate: (score: RiskScore, findings: string[], recommendations: string[]) => void;
}

export interface RiskScoreRule {
  min: number;
  max: number;
  level: RiskLevel;
}

export interface RiskScoreAdjustment {
  factor: string;
  adjustment: number;
}

export interface RiskMetric {
  name: string;
  score: number;
  description: string;
  severity: RiskLevel;
  recommendations: string[];
}

export interface RiskAnalysis {
  overallRisk: RiskLevel;
  totalScore: number;
  factors: RiskFactor[];
  summary: string;
  overallScore: number;
  severity: RiskLevel;
  contextualFactors: string[];
  metrics: RiskMetric[];
}

export interface RiskModalProps {
  isOpen: boolean;
  onClose: () => void;
  factor: RiskFactor;
  onSave: (score: RiskScore, findings: string[], recommendations: string[]) => void;
} 