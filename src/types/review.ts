import { RiskAnalysis } from './risk';

export interface CompensationComponents {
  baseTotal: number;
  productivityTotal: number;
  callTotal: number;
  adminTotal: number;
  qualityTotal: number;
}

export interface CompensationData {
  components: CompensationComponents;
  total: number;
  wrvus: number;
  perWrvu: number;
}

export interface FmvReview {
  providerId: string;
  providerName: string;
  specialty: string;
  status: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
  reviewerName: string;
  reviewDate: string;
  comments: string;
  riskAnalysis: RiskAnalysis;
  compensation: CompensationData;
} 