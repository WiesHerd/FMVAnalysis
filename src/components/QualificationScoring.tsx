import React, { useState, useCallback } from 'react';
import { useRiskConfig } from '../context/RiskConfigContext';
import { Card } from './ui';

interface QualificationScoringProps {
  providerId: string;
  onScoreUpdate: (totalPoints: number) => void;
}

const QualificationScoring: React.FC<QualificationScoringProps> = ({
  providerId,
  onScoreUpdate
}) => {
  const { qualificationCriteria, saveFmvReview, loadFmvReview } = useRiskConfig();
  const [scores, setScores] = useState<Record<string, number>>(() => {
    const savedReview = loadFmvReview(providerId);
    return savedReview?.qualificationScores?.criteria || {};
  });

  const calculateTotalPoints = useCallback(() => {
    return Object.values(scores).reduce((sum, score) => sum + score, 0);
  }, [scores]);

  const handleScoreChange = (criteriaId: string, value: string | number | string[]) => {
    const criterion = qualificationCriteria.find(c => c.id === criteriaId);
    if (!criterion) return;

    let points = 0;
    if (criterion.type === 'range') {
      const numValue = Number(value);
      const range = criterion.points.ranges?.find(
        r => numValue >= r.min && numValue <= r.max
      );
      points = range?.points || 0;
    } else if (criterion.type === 'multi-select') {
      const selectedValues = Array.isArray(value) ? value : [value];
      points = selectedValues.reduce((sum, val) => {
        const option = criterion.points.options?.find(opt => opt.value === val);
        return sum + (option?.points || 0);
      }, 0);
    }

    const newScores = { ...scores, [criteriaId]: points };
    setScores(newScores);
    
    const totalPoints = Object.values(newScores).reduce((sum, score) => sum + score, 0);
    onScoreUpdate(totalPoints);

    // Save to local storage
    const savedReview = loadFmvReview(providerId);
    if (savedReview) {
      saveFmvReview({
        ...savedReview,
        qualificationScores: {
          providerId,
          criteria: newScores,
          totalPoints,
          lastUpdated: new Date().toISOString()
        }
      });
    }
  };

  const renderCriterion = (criterion: typeof qualificationCriteria[0]) => {
    switch (criterion.type) {
      case 'range':
        return (
          <div key={criterion.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {criterion.name}
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                min={criterion.points.ranges?.[0].min || 0}
                max={criterion.points.ranges?.[criterion.points.ranges.length - 1].max || 100}
                value={scores[criterion.id] || ''}
                onChange={(e) => handleScoreChange(criterion.id, e.target.value)}
                className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <div className="text-sm text-gray-500">
                {criterion.points.ranges?.find(r => 
                  (scores[criterion.id] || 0) >= r.min && 
                  (scores[criterion.id] || 0) <= r.max
                )?.description || 'Not specified'}
              </div>
            </div>
          </div>
        );

      case 'multi-select':
        return (
          <div key={criterion.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {criterion.name}
            </label>
            <div className="space-y-2">
              {criterion.points.options?.map(option => (
                <div key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={scores[criterion.id]?.includes(option.value)}
                    onChange={(e) => {
                      const currentValues = scores[criterion.id] || [];
                      const newValues = e.target.checked
                        ? [...currentValues, option.value]
                        : currentValues.filter(v => v !== option.value);
                      handleScoreChange(criterion.id, newValues);
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 flex items-center text-sm text-gray-700">
                    {option.description}
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {option.points} points
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card title="Provider Qualifications">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Qualification Scoring</h3>
          <div className="text-sm font-medium text-blue-600">
            Total Points: {calculateTotalPoints()}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {qualificationCriteria.map(renderCriterion)}
        </div>
      </div>
    </Card>
  );
};

export default QualificationScoring; 