import { RiskAnalysis } from '../types/risk';

interface FmvReview {
  providerId: string;
  riskAnalysis: RiskAnalysis;
  reviewerName: string;
  comments: string;
  dateCreated: string;
  dateModified: string;
}

export const loadFmvReview = (providerId: string): FmvReview | null => {
  const storedReview = localStorage.getItem(`fmv_review_${providerId}`);
  return storedReview ? JSON.parse(storedReview) : null;
};

export const saveFmvReview = (review: FmvReview): void => {
  localStorage.setItem(`fmv_review_${review.providerId}`, JSON.stringify(review));
}; 