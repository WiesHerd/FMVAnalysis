import React, { createContext, useState, useCallback, useContext } from 'react';

// Export interfaces
export interface RiskThreshold {
  max: number;
  points: number;
  risk: 'low' | 'medium' | 'high';
}

export interface RiskCategory {
  id: string;
  name: string;
  description: string;
  thresholds: RiskThreshold[];
}

export interface RiskScoringConfig {
  categories: RiskCategory[];
  riskLevels: {
    max: number;
    risk: 'low' | 'medium' | 'high';
  }[];
}

export interface QualificationCriteria {
  id: string;
  name: string;
  type: 'range' | 'boolean' | 'multi-select';
  points: {
    ranges?: Array<{
      min: number;
      max: number;
      points: number;
      description: string;
    }>;
    options?: Array<{
      value: string;
      points: number;
      description: string;
    }>;
  };
}

export interface ProviderQualificationScore {
  providerId: string;
  criteria: Record<string, number>;
  totalPoints: number;
  lastUpdated: string;
}

export interface FmvReviewState {
  providerId: string;
  providerName: string;
  specialty: string;
  reviewDate: string;
  qualificationScores: ProviderQualificationScore;
  riskAnalysis: any; // Replace with proper type
  marketContext: any; // Replace with proper type
  compensationData: {
    total: number;
    components: Record<string, number>;
    benchmarks: any[]; // Replace with proper type
  };
  findings: string[];
  recommendations: string[];
  status: 'draft' | 'completed' | 'archived';
  lastModified: string;
}

export const defaultRiskConfig: RiskScoringConfig = {
  categories: [
    {
      id: 'clinical_compensation',
      name: 'Clinical Compensation Risk',
      description: 'Analysis of compensation vs productivity alignment',
      thresholds: [
        { max: 50, points: 0, risk: 'low' },
        { max: 75, points: 1, risk: 'medium' },
        { max: 90, points: 2, risk: 'medium' },
        { max: 100, points: 3, risk: 'high' }
      ]
    },
    {
      id: 'market_factors',
      name: 'Market Factors Risk',
      description: 'Analysis of geographic and specialty market conditions',
      thresholds: [
        { max: 1, points: 0, risk: 'low' },
        { max: 2, points: 1, risk: 'medium' },
        { max: 3, points: 2, risk: 'medium' },
        { max: 4, points: 3, risk: 'high' }
      ]
    }
  ],
  riskLevels: [
    { max: 3, risk: 'low' },
    { max: 6, risk: 'medium' },
    { max: 12, risk: 'high' }
  ]
};

export interface RiskConfigContextType {
  config: RiskScoringConfig;
  updateConfig: (config: RiskScoringConfig) => void;
  qualificationCriteria: QualificationCriteria[];
  updateQualificationCriteria: (criteria: QualificationCriteria[]) => void;
  saveFmvReview: (review: FmvReviewState) => void;
  loadFmvReview: (providerId: string) => FmvReviewState | null;
  savedReviews: FmvReviewState[];
}

export const defaultQualificationCriteria: QualificationCriteria[] = [
  {
    id: 'years_experience',
    name: 'Years of Experience',
    type: 'range',
    points: {
      ranges: [
        { min: 0, max: 2, points: 0, description: 'Early Career' },
        { min: 3, max: 5, points: 1, description: 'Established' },
        { min: 6, max: 10, points: 2, description: 'Experienced' },
        { min: 11, max: Infinity, points: 3, description: 'Senior' }
      ]
    }
  },
  {
    id: 'board_certification',
    name: 'Board Certification',
    type: 'multi-select',
    points: {
      options: [
        { value: 'primary', points: 1, description: 'Primary Board Certification' },
        { value: 'subspecialty', points: 1, description: 'Subspecialty Certification' },
        { value: 'additional', points: 1, description: 'Additional Certifications' }
      ]
    }
  },
  {
    id: 'academic_appointment',
    name: 'Academic Appointment',
    type: 'multi-select',
    points: {
      options: [
        { value: 'clinical_instructor', points: 1, description: 'Clinical Instructor' },
        { value: 'assistant_professor', points: 2, description: 'Assistant Professor' },
        { value: 'associate_professor', points: 2, description: 'Associate Professor' },
        { value: 'full_professor', points: 3, description: 'Full Professor' }
      ]
    }
  },
  {
    id: 'leadership_roles',
    name: 'Leadership Roles',
    type: 'multi-select',
    points: {
      options: [
        { value: 'medical_director', points: 2, description: 'Medical Director' },
        { value: 'department_chair', points: 3, description: 'Department Chair' },
        { value: 'committee_chair', points: 1, description: 'Committee Chair' },
        { value: 'program_director', points: 2, description: 'Program Director' }
      ]
    }
  }
];

export const RiskConfigContext = createContext<RiskConfigContextType>({
  config: defaultRiskConfig,
  updateConfig: () => {},
  qualificationCriteria: defaultQualificationCriteria,
  updateQualificationCriteria: () => {},
  saveFmvReview: () => {},
  loadFmvReview: () => null,
  savedReviews: []
});

export const RiskConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<RiskScoringConfig>(defaultRiskConfig);
  const [qualificationCriteria, setQualificationCriteria] = useState<QualificationCriteria[]>(defaultQualificationCriteria);
  const [savedReviews, setSavedReviews] = useState<FmvReviewState[]>([]);

  const updateConfig = useCallback((newConfig: RiskScoringConfig) => {
    setConfig(newConfig);
    localStorage.setItem('riskConfig', JSON.stringify(newConfig));
  }, []);

  const updateQualificationCriteria = useCallback((criteria: QualificationCriteria[]) => {
    setQualificationCriteria(criteria);
    localStorage.setItem('qualificationCriteria', JSON.stringify(criteria));
  }, []);

  const saveFmvReview = useCallback((review: FmvReviewState) => {
    const reviews = JSON.parse(localStorage.getItem('fmvReviews') || '{}');
    reviews[review.providerId] = review;
    localStorage.setItem('fmvReviews', JSON.stringify(reviews));
    setSavedReviews(Object.values(reviews));
  }, []);

  const loadFmvReview = useCallback((providerId: string): FmvReviewState | null => {
    const reviews = JSON.parse(localStorage.getItem('fmvReviews') || '{}');
    return reviews[providerId] || null;
  }, []);

  // Load saved data on mount
  React.useEffect(() => {
    const savedConfig = localStorage.getItem('riskConfig');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }

    const savedCriteria = localStorage.getItem('qualificationCriteria');
    if (savedCriteria) {
      setQualificationCriteria(JSON.parse(savedCriteria));
    }

    const savedReviewsData = localStorage.getItem('fmvReviews');
    if (savedReviewsData) {
      setSavedReviews(Object.values(JSON.parse(savedReviewsData)));
    }
  }, []);

  return (
    <RiskConfigContext.Provider
      value={{
        config,
        updateConfig,
        qualificationCriteria,
        updateQualificationCriteria,
        saveFmvReview,
        loadFmvReview,
        savedReviews
      }}
    >
      {children}
    </RiskConfigContext.Provider>
  );
};

export const useRiskConfig = () => useContext(RiskConfigContext); 