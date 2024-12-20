export const calculateRiskLevel = (totalScore: number): 'low' | 'medium' | 'high' | 'critical' => {
  if (totalScore <= 3) return 'low';
  if (totalScore <= 6) return 'medium';
  if (totalScore <= 9) return 'high';
  return 'critical';
};

export const calculateTotalScore = (scores: number[]): number => {
  return scores.reduce((sum, score) => sum + score, 0);
}; 