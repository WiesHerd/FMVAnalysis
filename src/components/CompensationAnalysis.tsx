import React, { useState, useMemo, useContext, useCallback, useEffect } from 'react';
import { Card } from 'antd';
import Modal from './Modal';
import TrashIcon from './TrashIcon';
import { calculatePercentile } from '../utils/calculations';

// Helper functions
const calculateMonthsSinceReview = (reviewDate: Date | null): number => {
  if (!reviewDate) return 12;
  return (new Date().getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
};

interface Benchmark {
  percentile: string;
  tcc: number;
  clinicalFte: number;
  wrvus: number;
  conversionFactor: number;
  callRate: number;
  adminRate: number;
}

interface RiskMetric {
  name: string;
  score: number;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

interface RiskAnalysis {
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

interface MarketData {
  specialtyDemand: 'low' | 'medium' | 'high';
  geographicRegion: string;
  marketCompetition: 'low' | 'medium' | 'high';
  localMarketRates: number;
  recruitmentDifficulty: 'low' | 'medium' | 'high';
  costOfLiving: number;
}

interface CompensationAnalysisProps {
  compensation: {
    total: number;
    wrvus: number;
    perWrvu: number;
    components: {
      baseTotal: number;
      productivityTotal: number;
      callTotal: number;
      adminTotal: number;
      qualityTotal: number;
    };
    providerName: string;
    specialty: string;
    marketData: MarketData;
    providerProfile: {
      yearsExperience: number;
      specialCertifications: string[];
      academicAppointment?: string;
      uniqueSkills: string[];
    };
    qualityMetrics: {
      type: 'objective' | 'subjective' | 'mixed';
      metrics: Array<{
        name: string;
        target: number;
        actual: number;
        weight: number;
      }>;
    };
    documentation: {
      methodology: string;
      supportingDocs: string[];
      lastReviewDate: string;
    };
    compliance: {
      starkCompliance: boolean;
      aksPolicies: boolean;
      referralAnalysis: {
        hasReferralConnection: boolean;
        referralImpact: 'none' | 'indirect' | 'direct';
      };
    };
    businessCase: {
      needJustification: string;
      strategicAlignment: string;
      financialImpact: {
        revenue: number;
        expenses: number;
        roi: number;
      };
    };
  };
  benchmarks: Benchmark[];
  onUpdate: (updates: Partial<{
    total: number;
    wrvus: number;
    perWrvu: number;
    components: {
      baseTotal: number;
      productivityTotal: number;
      callTotal: number;
      adminTotal: number;
      qualityTotal: number;
    };
  }>) => void;
}

interface CompensationComponents {
  baseTotal: number;
  productivityTotal: number;
  callTotal: number;
  adminTotal: number;
  qualityTotal: number;
}

interface RiskFactor {
  category: string;
  description: string;
  score: 0 | 1 | 2 | 3;
  findings: string[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

interface RiskAnalysis {
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

// Add new interfaces for risk scoring
interface RiskScoreRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  score: number;
  isEnabled: boolean;
}

interface RiskScoreAdjustment {
  id: string;
  description: string;
  score: number;
}

// Add new interfaces for editable context
interface MarketContext {
  specialtyDemand: 'low' | 'medium' | 'high';
  geographicRegion: string;
  marketCompetition: 'low' | 'medium' | 'high';
  localMarketRates: number;
  recruitmentDifficulty: 'low' | 'medium' | 'high';
  costOfLiving: number;
}

interface RiskFactorContext {
  market: {
    specialtyDemand: 'low' | 'medium' | 'high';
    geographicRegion: string;
    marketCompetition: 'low' | 'medium' | 'high';
    localMarketRates: number;
    recruitmentDifficulty: 'low' | 'medium' | 'high';
    costOfLiving: number;
  };
  provider: {
    yearsExperience: number;
    specialCertifications: string[];
    uniqueSkills: string[];
    academicAppointment?: string;
    specialty?: string;
    name?: string;
  };
  practice: {
    caseComplexity: 'low' | 'medium' | 'high';
    qualityMetrics: {
      type: 'objective' | 'subjective' | 'mixed';
      metrics: { name: string; target: number; actual: number; weight: number; }[];
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
    researchActive: boolean;
    teachingResponsibilities: boolean;
    strategicImportance: 'low' | 'medium' | 'high';
    leadershipRole?: string;
  };
  compensation: {
    total: number;
    tccPercentile: number;
    wrvuPercentile: number;
    components: {
      baseTotal: number;
      productivityTotal: number;
      callTotal: number;
      adminTotal: number;
    };
  };
  documentation: {
    lastReviewDate: string;
    methodology: string;
    supportingDocs: string[];
  };
  compliance: {
    starkCompliance: boolean;
    aksPolicies: boolean;
    referralAnalysis: {
      hasReferralConnection: boolean;
      referralImpact: 'none' | 'low' | 'medium' | 'high';
    };
  };
  businessCase: {
    needJustification: string;
    strategicAlignment: string;
    financialImpact: {
      revenue: number;
      expenses: number;
      roi: number;
    };
  };
}

// Add RiskScoringConfig interface
interface RiskThreshold {
  max: number;
  points: number;
  risk: 'low' | 'medium' | 'high';
}

interface RiskCategory {
  id: string;
  name: string;
  description: string;
  thresholds: RiskThreshold[];
  evaluator: (context: any) => number;
  findings: (context: any) => string[];
  recommendations: (score: number, context: any) => string[];
}

interface RiskScoringConfig {
  categories: RiskCategory[];
  riskLevels: {
    max: number;
    risk: 'low' | 'medium' | 'high';
  }[];
}

// Add default risk scoring configuration
const defaultRiskConfig: RiskScoringConfig = {
  categories: [
    {
      id: 'compensation_level',
      name: 'Clinical Compensation Risk',
      description: 'Analysis of compensation components and productivity alignment',
      thresholds: [
        { max: 50, points: 0, risk: 'low' },
        { max: 75, points: 1, risk: 'medium' },
        { max: 90, points: 2, risk: 'medium' },
        { max: 100, points: 3, risk: 'high' }
      ],
      evaluator: (context: RiskFactorContext) => {
        let score = 0;
        const tccPercentile = context.compensation?.tccPercentile || 0;
        const wrvuPercentile = context.compensation?.wrvuPercentile || 0;
        const components = context.compensation?.components || {};
        const total = Object.values(components).reduce((sum: number, val: number) => sum + (val || 0), 0) || 1;
        
        // 1. Base score based on compensation percentile
        if (tccPercentile > 90) score += 2;
        else if (tccPercentile > 75) score += 1;
        
        // 2. Productivity alignment
        const productivityGap = tccPercentile - wrvuPercentile;
        if (productivityGap > 25) score += 3;
        else if (productivityGap > 15) score += 2;
        else if (productivityGap > 10) score += 1;
        
        // 3. Compensation mix risk
        const baseRatio = (components.baseTotal || 0) / total;
        if (baseRatio > 0.9) score += 1;
        
        // 4. Quality metrics consideration
        const qualityMetrics = context.practice?.qualityMetrics;
        if (qualityMetrics?.score < qualityMetrics?.benchmark * 0.8) score += 1;
        
        // 5. Market position adjustment
        if (context.market?.specialtyDemand === 'high' && tccPercentile > 75) score -= 1;
        if (context.provider?.yearsExperience > 10 && tccPercentile > 75) score -= 1;
        
        return Math.min(score, 3); // Cap at 3 points
      },
      findings: (context: RiskFactorContext) => {
        const tccPercentile = context.compensation?.tccPercentile || 0;
        const wrvuPercentile = context.compensation?.wrvuPercentile || 0;
        const productivityGap = tccPercentile - wrvuPercentile;
        const components = context.compensation?.components || {};
        const total = Object.values(components).reduce((sum: number, val: number) => sum + (val || 0), 0) || 1;
        const baseRatio = (components.baseTotal || 0) / total;
        
        const findings = [
          `Total compensation at ${tccPercentile.toFixed(1)}th percentile`,
          `Clinical productivity at ${wrvuPercentile.toFixed(1)}th percentile`,
          `Productivity gap: ${productivityGap.toFixed(1)} percentile points`,
          `Base salary ratio: ${(baseRatio * 100).toFixed(1)}%`
        ];

        if (context.practice?.qualityMetrics?.score !== undefined) {
          findings.push(`Quality metrics: ${((context.practice.qualityMetrics.score / context.practice.qualityMetrics.benchmark) * 100).toFixed(1)}% of benchmark`);
        }

        if (productivityGap > 15) {
          findings.push('WARNING: Significant compensation-productivity misalignment');
        }

        if (baseRatio > 0.9) {
          findings.push('NOTE: High guaranteed compensation ratio');
        }

        return findings;
      },
      recommendations: (score: number, context: RiskFactorContext) => {
        const recs = [];
        const tccPercentile = context.compensation?.tccPercentile || 0;
        const wrvuPercentile = context.compensation?.wrvuPercentile || 0;

        if (score >= 2) {
          recs.push('Document specific factors justifying above-market compensation');
          if (wrvuPercentile < tccPercentile - 15) {
            recs.push('Review productivity expectations and establish improvement targets');
            recs.push('Consider implementing a productivity-based compensation component');
          }
        }

        if (tccPercentile > 90) {
          recs.push('Ensure documentation of any unique skills, experience, or market conditions');
          recs.push('Consider implementing quality metrics for performance monitoring');
        }

        if (score <= 1) {
          recs.push('Continue monitoring compensation-productivity alignment');
        }

        return recs;
      }
    },
    {
      id: 'market_factors',
      name: 'Market Factors Risk',
      description: 'Analysis of market conditions and specialty demand',
      thresholds: [
        { max: 1, points: 0, risk: 'low' },
        { max: 2, points: 1, risk: 'medium' },
        { max: 3, points: 2, risk: 'medium' },
        { max: 4, points: 3, risk: 'high' }
      ],
      evaluator: (context: RiskFactorContext) => {
        let score = 0;
        const demand = context.market?.specialtyDemand || 'medium';
        const competition = context.market?.marketCompetition || 'medium';
        const recruitment = context.market?.recruitmentDifficulty || 'medium';
        const costOfLiving = context.market?.costOfLiving || 100;
        
        // 1. Specialty demand impact
        if (demand === 'high') score += 2;
        else if (demand === 'medium') score += 1;
        
        // 2. Market competition
        if (competition === 'high') score += 1;
        
        // 3. Recruitment difficulty
        if (recruitment === 'high') score += 1;
        
        // 4. Cost of living adjustment
        if (costOfLiving > 150) score += 1;
        else if (costOfLiving > 125) score += 0.5;
        
        // 5. Geographic considerations
        if (context.market?.geographicRegion?.toLowerCase().includes('rural')) {
          score += 1; // Rural areas often require higher compensation
        }
        
        // 6. Risk reduction factors
        if (context.provider?.specialCertifications?.length > 0) score -= 0.5;
        if (context.provider?.uniqueSkills?.length > 0) score -= 0.5;
        
        return Math.min(Math.round(score), 3); // Round and cap at 3 points
      },
      findings: (context: RiskFactorContext) => {
        const findings = [
          `Specialty demand: ${context.market?.specialtyDemand || 'Not specified'}`,
          `Market competition: ${context.market?.marketCompetition || 'Not specified'}`,
          `Geographic region: ${context.market?.geographicRegion || 'Not specified'}`,
          `Recruitment difficulty: ${context.market?.recruitmentDifficulty || 'Not specified'}`,
          `Cost of living index: ${context.market?.costOfLiving || 100}`
        ];

        if (context.provider?.specialCertifications?.length > 0) {
          findings.push(`Special certifications: ${context.provider.specialCertifications.join(', ')}`);
        }

        if (context.provider?.uniqueSkills?.length > 0) {
          findings.push(`Unique skills: ${context.provider.uniqueSkills.join(', ')}`);
        }

        // Add market-specific insights
        if (context.market?.specialtyDemand === 'high' && context.market?.marketCompetition === 'high') {
          findings.push('NOTE: High-demand specialty in competitive market');
        }

        if (context.market?.costOfLiving > 125) {
          findings.push('NOTE: High cost of living market adjustment needed');
        }

        if (context.market?.geographicRegion?.toLowerCase().includes('rural')) {
          findings.push('NOTE: Rural location compensation considerations');
        }

        return findings;
      },
      recommendations: (score: number, context: RiskFactorContext) => {
        const recs = [];
        
        if (score >= 2) {
          recs.push('Document market conditions and recruitment challenges');
          recs.push('Develop retention strategies beyond compensation');
          
          if (context.market?.costOfLiving > 125) {
            recs.push('Consider cost of living adjustments in compensation structure');
          }
          
          if (context.market?.specialtyDemand === 'high') {
            recs.push('Implement market monitoring for compensation trends');
            recs.push('Consider sign-on or retention bonuses');
          }
        }

        if (context.market?.geographicRegion?.toLowerCase().includes('rural')) {
          recs.push('Consider rural practice incentives');
        }

        if (score <= 1) {
          recs.push('Continue monitoring market conditions');
        }

        return recs;
      }
    },
    {
      id: 'documentation',
      name: 'Documentation Risk',
      description: 'Analysis of FMV documentation completeness',
      thresholds: [
        { max: 1, points: 0, risk: 'low' },
        { max: 2, points: 1, risk: 'medium' },
        { max: 3, points: 2, risk: 'medium' },
        { max: 4, points: 3, risk: 'high' }
      ],
      evaluator: (context: RiskFactorContext) => {
        let score = 0;
        const docs = context.documentation || {};
        const compliance = context.compliance || {};
        
        // 1. FMV methodology documentation - Check for specific required elements
        const methodologyElements = {
          marketDataSources: docs.methodology?.includes('market data') || docs.methodology?.includes('survey data'),
          compensationApproach: docs.methodology?.includes('compensation approach') || docs.methodology?.includes('compensation model'),
          benchmarkSelection: docs.methodology?.includes('benchmark') || docs.methodology?.includes('percentile'),
          productivityMetrics: docs.methodology?.includes('wRVU') || docs.methodology?.includes('productivity'),
          specialtyConsiderations: docs.methodology?.includes('specialty') || docs.methodology?.includes('subspecialty'),
          geographicAdjustments: docs.methodology?.includes('geographic') || docs.methodology?.includes('location'),
          qualityMetrics: docs.methodology?.includes('quality') || docs.methodology?.includes('performance'),
          callCoverage: docs.methodology?.includes('call coverage') || docs.methodology?.includes('on-call'),
          adminDuties: docs.methodology?.includes('administrative') || docs.methodology?.includes('leadership'),
          complianceConsiderations: docs.methodology?.includes('Stark') || docs.methodology?.includes('AKS')
        };

        const presentElements = Object.values(methodologyElements).filter(Boolean).length;
        
        if (!docs.methodology) {
          score += 3; // Missing methodology entirely
        } else {
          if (presentElements <= 3) score += 2;
          else if (presentElements <= 6) score += 1;
          else if (presentElements <= 8) score += 0.5;
        }
        
        // 2. Supporting documentation - Check for specific required documents
        const requiredDocs = [
          'market_survey_data',
          'benchmark_analysis',
          'productivity_data',
          'compensation_model',
          'compliance_checklist'
        ];
        
        const presentDocs = (docs.supportingDocs?.filter(doc => 
          requiredDocs.some(required => doc.toLowerCase().includes(required.replace('_', ' ')))
        ) || []).length;
        
        if (presentDocs === 0) score += 2;
        else if (presentDocs <= 2) score += 1;
        else if (presentDocs <= 4) score += 0.5;
        
        // 3. Review date currency
        const lastReviewDate = docs.lastReviewDate ? new Date(docs.lastReviewDate) : null;
        const monthsSinceReview = calculateMonthsSinceReview(lastReviewDate);
        
        if (!lastReviewDate) score += 1;
        else if (monthsSinceReview > 12) score += 1;
        else if (monthsSinceReview > 6) score += 0.5;
        
        // 4. Compliance documentation
        if (!compliance.starkCompliance) score += 1;
        if (!compliance.aksPolicies) score += 1;
        
        // 5. Referral analysis documentation
        if (compliance.referralAnalysis?.hasReferralConnection && 
            compliance.referralAnalysis.referralImpact !== 'none') {
          const referralDocs = [
            docs.methodology?.includes('referral analysis'),
            docs.methodology?.includes('volume analysis'),
            docs.methodology?.includes('commercial reasonableness')
          ].filter(Boolean).length;
          
          if (referralDocs === 0) score += 2;
          else if (referralDocs === 1) score += 1;
        }
        
        return Math.min(Math.round(score), 3);
      },
      findings: (context: RiskFactorContext) => {
        const docs = context.documentation || {};
        const compliance = context.compliance || {};
        
        // Analyze methodology components
        const methodologyElements = {
          'Market Data Sources': docs.methodology?.includes('market data') || docs.methodology?.includes('survey data'),
          'Compensation Approach': docs.methodology?.includes('compensation approach') || docs.methodology?.includes('compensation model'),
          'Benchmark Selection': docs.methodology?.includes('benchmark') || docs.methodology?.includes('percentile'),
          'Productivity Metrics': docs.methodology?.includes('wRVU') || docs.methodology?.includes('productivity'),
          'Specialty Considerations': docs.methodology?.includes('specialty') || docs.methodology?.includes('subspecialty'),
          'Geographic Adjustments': docs.methodology?.includes('geographic') || docs.methodology?.includes('location'),
          'Quality Metrics': docs.methodology?.includes('quality') || docs.methodology?.includes('performance'),
          'Call Coverage': docs.methodology?.includes('call coverage') || docs.methodology?.includes('on-call'),
          'Administrative Duties': docs.methodology?.includes('administrative') || docs.methodology?.includes('leadership'),
          'Compliance Considerations': docs.methodology?.includes('Stark') || docs.methodology?.includes('AKS')
        };

        const findings = [];
        
        // Methodology completeness
        const presentElements = Object.entries(methodologyElements)
          .filter(([_, present]) => present)
          .map(([name]) => name);
        
        findings.push(`FMV Methodology includes ${presentElements.length}/10 required elements:`);
        presentElements.forEach(element => findings.push(`✓ ${element}`));
        
        Object.entries(methodologyElements)
          .filter(([_, present]) => !present)
          .forEach(([name]) => findings.push(`⚠ Missing: ${name}`));

        // Supporting documentation
        const requiredDocs = [
          'Market Survey Data',
          'Benchmark Analysis',
          'Productivity Data',
          'Compensation Model',
          'Compliance Checklist'
        ];
        
        const presentDocs = docs.supportingDocs?.map(doc => {
          const matchedDoc = requiredDocs.find(required => 
            doc.toLowerCase().includes(required.toLowerCase())
          );
          return matchedDoc || doc;
        }) || [];
        
        findings.push(`\nSupporting Documentation: ${presentDocs.length}/${requiredDocs.length} required documents:`);
        presentDocs.forEach(doc => findings.push(`✓ ${doc}`));
        
        requiredDocs
          .filter(doc => !presentDocs.includes(doc))
          .forEach(doc => findings.push(`��� Missing: ${doc}`));

        // Review date
        const lastReviewDate = docs.lastReviewDate ? new Date(docs.lastReviewDate) : null;
        const monthsSinceReview = calculateMonthsSinceReview(lastReviewDate);
        
        findings.push(`\nLast Review: ${lastReviewDate ? 
          `${Math.round(monthsSinceReview)} months ago (${monthsSinceReview <= 6 ? 'Current' : 
            monthsSinceReview <= 12 ? 'Due for review' : 'Overdue'})` : 
          'Not documented'}`);

        // Compliance documentation
        findings.push(`\nCompliance Documentation:`);
        findings.push(`${compliance.starkCompliance ? '✓' : '⚠'} Stark Law Analysis`);
        findings.push(`${compliance.aksPolicies ? '✓' : '⚠'} Anti-Kickback Statute Policies`);
        
        if (compliance.referralAnalysis?.hasReferralConnection) {
          findings.push(`\nReferral Analysis: ${compliance.referralAnalysis.referralImpact}`);
          if (docs.methodology?.includes('referral analysis')) {
            findings.push('✓ Referral analysis documented');
          } else {
            findings.push('⚠ Missing referral analysis documentation');
          }
        }

        return findings;
      },
      recommendations: (score: number, context: RiskFactorContext) => {
        const recs = [];
        const docs = context.documentation || {};
        const compliance = context.compliance || {};
        
        // Missing methodology elements
        const methodologyElements = {
          'Market Data Sources': docs.methodology?.includes('market data') || docs.methodology?.includes('survey data'),
          'Compensation Approach': docs.methodology?.includes('compensation approach') || docs.methodology?.includes('compensation model'),
          'Benchmark Selection': docs.methodology?.includes('benchmark') || docs.methodology?.includes('percentile'),
          'Productivity Metrics': docs.methodology?.includes('wRVU') || docs.methodology?.includes('productivity'),
          'Specialty Considerations': docs.methodology?.includes('specialty') || docs.methodology?.includes('subspecialty'),
          'Geographic Adjustments': docs.methodology?.includes('geographic') || docs.methodology?.includes('location'),
          'Quality Metrics': docs.methodology?.includes('quality') || docs.methodology?.includes('performance'),
          'Call Coverage': docs.methodology?.includes('call coverage') || docs.methodology?.includes('on-call'),
          'Administrative Duties': docs.methodology?.includes('administrative') || docs.methodology?.includes('leadership'),
          'Compliance Considerations': docs.methodology?.includes('Stark') || docs.methodology?.includes('AKS')
        };

        const missingElements = Object.entries(methodologyElements)
          .filter(([_, present]) => !present)
          .map(([name]) => name);

        if (missingElements.length > 0) {
          recs.push('Document FMV methodology to include:');
          missingElements.forEach(element => 
            recs.push(`- ${element} analysis and considerations`)
          );
        }

        // Missing supporting documents
        const requiredDocs = [
          'Market Survey Data',
          'Benchmark Analysis',
          'Productivity Data',
          'Compensation Model',
          'Compliance Checklist'
        ];
        
        const missingDocs = requiredDocs.filter(doc => 
          !docs.supportingDocs?.some(supportingDoc => 
            supportingDoc.toLowerCase().includes(doc.toLowerCase())
          )
        );

        if (missingDocs.length > 0) {
          recs.push('\nObtain and document required supporting materials:');
          missingDocs.forEach(doc => 
            recs.push(`- ${doc}`)
          );
        }

        // Review date
        const lastReviewDate = docs.lastReviewDate ? new Date(docs.lastReviewDate) : null;
        const monthsSinceReview = calculateMonthsSinceReview(lastReviewDate);

        if (!lastReviewDate || monthsSinceReview > 12) {
          recs.push('\nConduct and document comprehensive FMV review:');
          recs.push('- Update all market data and benchmarks');
          recs.push('- Review compensation model assumptions');
          recs.push('- Validate compliance with current regulations');
        } else if (monthsSinceReview > 6) {
          recs.push('\nSchedule next FMV review within 3 months');
        }

        // Compliance documentation
        if (!compliance.starkCompliance || !compliance.aksPolicies) {
          recs.push('\nComplete compliance documentation:');
          if (!compliance.starkCompliance) {
            recs.push('- Document Stark Law analysis and compliance');
          }
          if (!compliance.aksPolicies) {
            recs.push('- Document Anti-Kickback Statute safeguards');
          }
        }

        // Referral analysis
        if (compliance.referralAnalysis?.hasReferralConnection && 
            compliance.referralAnalysis.referralImpact !== 'none' &&
            !docs.methodology?.includes('referral analysis')) {
          recs.push('\nDocument referral relationship analysis:');
          recs.push('- Analyze referral patterns and volumes');
          recs.push('- Document commercial reasonableness');
          recs.push('- Implement referral monitoring process');
        }

        return recs;
      }
    },
    {
      id: 'structural',
      name: 'Structural Risk',
      description: 'Analysis of compensation structure and incentives',
      thresholds: [
        { max: 1, points: 0, risk: 'low' },
        { max: 2, points: 1, risk: 'medium' },
        { max: 3, points: 2, risk: 'medium' },
        { max: 4, points: 3, risk: 'high' }
      ],
      evaluator: (context: RiskFactorContext) => {
        let score = 0;
        const components = context.compensation?.components || {};
        const total = Object.values(components).reduce((sum: number, val: number) => sum + (val || 0), 0) || 1;
        
        // Calculate ratio of guaranteed compensation
        const guaranteedRatio = (components.baseTotal || 0) / total;
        
        if (guaranteedRatio > 0.9) score = 3;
        else if (guaranteedRatio > 0.75) score = 2;
        else if (guaranteedRatio > 0.6) score = 1;
        
        return score;
      },
      findings: (context: RiskFactorContext) => {
        const components = context.compensation?.components || {};
        const total = Object.values(components).reduce((sum: number, val: number) => sum + (val || 0), 0) || 1;
        return [
          `Base salary ratio: ${(((components.baseTotal || 0) / total) * 100).toFixed(1)}%`,
          `Productivity component ratio: ${(((components.productivityTotal || 0) / total) * 100).toFixed(1)}%`,
          `Other components ratio: ${(((components.callTotal || 0) + (components.adminTotal || 0)) / total * 100).toFixed(1)}%`
        ];
      },
      recommendations: (score: number, context: RiskFactorContext) => {
        if (score <= 1) return [];
        return [
          'Consider increasing productivity-based compensation',
          'Document justification for guaranteed compensation',
          'Review compensation structure alignment with market practices'
        ];
      }
    }
  ],
  riskLevels: [
    { max: 3, risk: 'low' },
    { max: 6, risk: 'medium' },
    { max: 12, risk: 'high' }
  ]
};

// Add RiskConfigContext
const RiskConfigContext = React.createContext<{
  config: RiskScoringConfig;
  updateConfig: (newConfig: RiskScoringConfig) => void;
}>({
  config: defaultRiskConfig,
  updateConfig: () => {}
});

// Add RiskConfigProvider component
const RiskConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<RiskScoringConfig>(defaultRiskConfig);

  const updateConfig = useCallback((newConfig: RiskScoringConfig) => {
    setConfig(newConfig);
  }, []);

  return (
    <RiskConfigContext.Provider value={{ config, updateConfig }}>
      {children}
    </RiskConfigContext.Provider>
  );
};

// Update RiskContextEditor component
const RiskContextEditor: React.FC<{
  context: RiskFactorContext;
  onUpdate: (context: RiskFactorContext) => void;
}> = ({ context, onUpdate }) => {
  const { config, updateConfig } = useContext(RiskConfigContext);
  
  return (
    <div className="space-y-6">
      {/* Market Context */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Market Context</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Specialty Demand</label>
            <select
              value={context.market.specialtyDemand}
              onChange={(e) => onUpdate({
                ...context,
                market: { ...context.market, specialtyDemand: e.target.value as 'low' | 'medium' | 'high' }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Market Competition</label>
            <select
              value={context.market.marketCompetition}
              onChange={(e) => onUpdate({
                ...context,
                market: { ...context.market, marketCompetition: e.target.value as 'low' | 'medium' | 'high' }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Geographic Region</label>
            <input
              type="text"
              value={context.market.geographicRegion}
              onChange={(e) => onUpdate({
                ...context,
                market: { ...context.market, geographicRegion: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Local Market Rate</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                value={context.market.localMarketRates}
                onChange={(e) => onUpdate({
                  ...context,
                  market: { ...context.market, localMarketRates: Number(e.target.value) }
                })}
                className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cost of Living Index</label>
            <input
              type="number"
              value={context.market.costOfLiving}
              onChange={(e) => onUpdate({
                ...context,
                market: { ...context.market, costOfLiving: Number(e.target.value) }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Provider Context */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Provider Context</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Years Experience</label>
            <input
              type="number"
              value={context.provider.yearsExperience}
              onChange={(e) => onUpdate({
                ...context,
                provider: { ...context.provider, yearsExperience: Number(e.target.value) }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Special Certifications</label>
            <input
              type="text"
              placeholder="Enter certifications (comma-separated)"
              value={context.provider.specialCertifications.join(', ')}
              onChange={(e) => onUpdate({
                ...context,
                provider: { 
                  ...context.provider, 
                  specialCertifications: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Academic Appointment</label>
            <input
              type="text"
              value={context.provider.academicAppointment || ''}
              onChange={(e) => onUpdate({
                ...context,
                provider: { ...context.provider, academicAppointment: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Unique Skills</label>
            <input
              type="text"
              placeholder="Enter skills (comma-separated)"
              value={context.provider.uniqueSkills.join(', ')}
              onChange={(e) => onUpdate({
                ...context,
                provider: { 
                  ...context.provider, 
                  uniqueSkills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Risk Scoring Configuration */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Scoring Configuration</h3>
        <div className="space-y-4">
          {config.categories.map(category => (
            <div key={category.id} className="border-b pb-4">
              <h4 className="font-medium text-gray-700">{category.name}</h4>
              <div className="mt-2 space-y-2">
                {category.thresholds.map((threshold, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-1">
                      <label className="text-sm text-gray-500">Max Value</label>
                      <input
                        type="number"
                        value={threshold.max}
                        onChange={(e) => {
                          const newConfig = { ...config };
                          newConfig.categories.find(c => c.id === category.id)!
                            .thresholds[index].max = Number(e.target.value);
                          updateConfig(newConfig);
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm text-gray-500">Points</label>
                      <input
                        type="number"
                        value={threshold.points}
                        onChange={(e) => {
                          const newConfig = { ...config };
                          newConfig.categories.find(c => c.id === category.id)!
                            .thresholds[index].points = Number(e.target.value);
                          updateConfig(newConfig);
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm text-gray-500">Risk Level</label>
                      <select
                        value={threshold.risk}
                        onChange={(e) => {
                          const newConfig = { ...config };
                          newConfig.categories.find(c => c.id === category.id)!
                            .thresholds[index].risk = e.target.value as 'low' | 'medium' | 'high';
                          updateConfig(newConfig);
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Update the main component to use RiskConfigProvider
const CompensationAnalysis: React.FC<CompensationAnalysisProps> = ({
  compensation: initialCompensation,
  benchmarks,
  onUpdate
}) => {
  const [compensation, setCompensation] = useState(initialCompensation);

  const handleUpdate = (updates: Partial<{
    total: number;
    wrvus: number;
    perWrvu: number;
    components: CompensationComponents;
  }>) => {
    const newCompensation = {
      ...compensation,
      total: updates.total || compensation.total,
      wrvus: updates.wrvus || compensation.wrvus,
      perWrvu: updates.perWrvu || compensation.perWrvu,
      components: updates.components || compensation.components
    };
    setCompensation(newCompensation);
    onUpdate(newCompensation);
  };

  return (
    <div className="space-y-6">
      <CompensationAnalysisContent 
        compensation={compensation}
        benchmarks={benchmarks}
        onUpdate={handleUpdate}
      />
    </div>
  );
};

// Move the main component content to a new component
const CompensationAnalysisContent: React.FC<CompensationAnalysisProps> = ({
  compensation,
  benchmarks: initialBenchmarks,
  onUpdate
}) => {
  // Validate and initialize benchmarks with default values
  const validateBenchmark = (b: any): Benchmark => ({
    percentile: b.percentile || '',
    tcc: Number(b.tcc) || 0,
    clinicalFte: Number(b.clinicalFte) || 0,
    wrvus: Number(b.wrvus) || 0,
    conversionFactor: Number(b.conversionFactor) || 0,
    callRate: Number(b.callRate) || 0,
    adminRate: Number(b.adminRate) || 0
  });

  // Initialize empty benchmarks
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);

  // Update benchmarks when initialBenchmarks prop changes
  useEffect(() => {
    if (initialBenchmarks && initialBenchmarks.length > 0) {
      setBenchmarks(initialBenchmarks.map(b => ({
        percentile: b.percentile,
        tcc: b.tcc || 0,
        wrvus: b.wrvus || 0,
        conversionFactor: b.conversionFactor || 0,
        clinicalFte: 1.0,
        callRate: 0,
        adminRate: 0
      })));
    }
  }, [initialBenchmarks]);

  const [isEditingBenchmarks, setIsEditingBenchmarks] = useState(false);
  const [isEditingComponents, setIsEditingComponents] = useState(false);
  
  // Initialize components with default values
  const initialComponents = {
    baseTotal: Number(compensation.components.baseTotal) || 0,
    productivityTotal: Number(compensation.components.productivityTotal) || 0,
    qualityTotal: Number(compensation.components.qualityTotal) || 0,
    adminTotal: Number(compensation.components.adminTotal) || 0,
    callTotal: Number(compensation.components.callTotal) || 0
  };

  const [components, setComponents] = useState<CompensationComponents>(initialComponents);

  // Update components when compensation changes
  useEffect(() => {
    setComponents({
      baseTotal: Number(compensation.components.baseTotal) || 0,
      productivityTotal: Number(compensation.components.productivityTotal) || 0,
      qualityTotal: Number(compensation.components.qualityTotal) || 0,
      adminTotal: Number(compensation.components.adminTotal) || 0,
      callTotal: Number(compensation.components.callTotal) || 0
    });
  }, [compensation.components]);

  const getPercentilePosition = (value: number, metric: keyof Benchmark) => {
    if (!benchmarks?.length) return 0;
    const benchmarkValues = benchmarks.map(b => Number(b[metric]));
    return calculatePercentile(value, benchmarkValues);
  };

  // Update the total display
  const totalCompensation = Object.values(components).reduce((sum, val) => sum + val, 0);

  // Update the percentile displays
  const tccPercentile = getPercentilePosition(totalCompensation, 'tcc');
  const wrvuPercentile = getPercentilePosition(compensation.wrvus, 'wrvus');
  const cfPercentile = getPercentilePosition(totalCompensation / (compensation.wrvus || 1), 'conversionFactor');

  const handleComponentChange = (field: keyof CompensationComponents, value: string) => {
    const numericValue = Number(value.replace(/[^0-9.-]+/g, ''));
    const newComponents = {
      ...components,
      [field]: numericValue
    };
    
    // Update local state
    setComponents(newComponents);

    // Calculate new total compensation
    const newTotal = Object.values(newComponents).reduce((sum, val) => sum + val, 0);

    // Calculate new per wRVU rate
    const newPerWrvu = compensation.wrvus > 0 ? newTotal / compensation.wrvus : 0;

    // Update parent component with new values
    onUpdate({
      total: newTotal,
      wrvus: compensation.wrvus,
      perWrvu: newPerWrvu,
      components: newComponents
    });
  };

  const [riskRules, setRiskRules] = useState<RiskScoreRule[]>([
    {
      id: 'productivity_alignment',
      name: 'Productivity Alignment',
      description: 'Adjust risk based on productivity vs compensation alignment',
      condition: 'wRVU percentile >= TCC percentile',
      score: -2,
      isEnabled: true
    },
    {
      id: 'experience_factor',
      name: 'Experience Factor',
      description: 'Adjust risk based on years of experience',
      condition: 'Years of experience > 10',
      score: -1,
      isEnabled: true
    }
  ]);

  const [riskAdjustments, setRiskAdjustments] = useState<RiskScoreAdjustment[]>([]);

  const handleRuleChange = (updatedRules: RiskScoreRule[]) => {
    setRiskRules(updatedRules);
  };

  const handleAdjustmentAdd = (adjustment: RiskScoreAdjustment) => {
    setRiskAdjustments(prev => [...prev, adjustment]);
  };

  const handleBenchmarkChange = (index: number, field: keyof Benchmark, value: string) => {
    const newBenchmarks = [...benchmarks];
    const numValue = parseFloat(value);
    
    if (!isNaN(numValue)) {
      newBenchmarks[index] = {
        ...newBenchmarks[index],
        [field]: numValue
      };
      setBenchmarks(newBenchmarks);
    }
  };

  const { config } = useContext(RiskConfigContext);
  
  const calculateRiskAnalysis = useMemo((): RiskAnalysis => {
    // Build the complete context object
    const context: RiskFactorContext = {
      market: {
        specialtyDemand: compensation.marketData?.specialtyDemand || 'medium',
        geographicRegion: compensation.marketData?.geographicRegion || '',
        marketCompetition: compensation.marketData?.marketCompetition || 'medium',
        localMarketRates: compensation.marketData?.localMarketRates || 0,
        recruitmentDifficulty: compensation.marketData?.recruitmentDifficulty || 'medium',
        costOfLiving: compensation.marketData?.costOfLiving || 100
      },
      provider: {
        yearsExperience: compensation.providerProfile?.yearsExperience || 0,
        specialCertifications: compensation.providerProfile?.specialCertifications || [],
        academicAppointment: compensation.providerProfile?.academicAppointment,
        uniqueSkills: compensation.providerProfile?.uniqueSkills || [],
        specialty: compensation.specialty,
        name: compensation.providerName
      },
      practice: {
        caseComplexity: 'medium',
        qualityMetrics: {
          type: compensation.qualityMetrics?.type || 'mixed',
          metrics: compensation.qualityMetrics?.metrics || [],
          score: compensation.qualityMetrics?.metrics.reduce((acc, m) => acc + m.actual, 0) || 0,
          benchmark: compensation.qualityMetrics?.metrics.reduce((acc, m) => acc + m.target, 0) || 0
        },
        patientSatisfaction: {
          score: 0,
          benchmark: 0
        },
        procedureMix: {
          highComplexity: 0,
          lowComplexity: 0
        }
      },
      program: {
        leadershipRole: compensation.documentation?.methodology.includes('leadership') ? 'Program Director' : undefined,
        researchActive: false,
        teachingResponsibilities: false,
        strategicImportance: 'medium'
      },
      compensation: {
        total: compensation.total,
        tccPercentile: getPercentilePosition(compensation.total, 'tcc'),
        wrvuPercentile: getPercentilePosition(compensation.wrvus, 'wrvus'),
        components: compensation.components
      },
      documentation: {
        methodology: compensation.documentation?.methodology || '',
        supportingDocs: compensation.documentation?.supportingDocs || [],
        lastReviewDate: compensation.documentation?.lastReviewDate || ''
      },
      compliance: {
        starkCompliance: compensation.compliance?.starkCompliance || false,
        aksPolicies: compensation.compliance?.aksPolicies || false,
        referralAnalysis: {
          hasReferralConnection: compensation.compliance?.referralAnalysis?.hasReferralConnection || false,
          referralImpact: compensation.compliance?.referralAnalysis?.referralImpact || 'none'
        }
      },
      businessCase: {
        needJustification: compensation.businessCase?.needJustification || '',
        strategicAlignment: compensation.businessCase?.strategicAlignment || '',
        financialImpact: {
          revenue: compensation.businessCase?.financialImpact?.revenue || 0,
          expenses: compensation.businessCase?.financialImpact?.expenses || 0,
          roi: compensation.businessCase?.financialImpact?.roi || 0
        }
      }
    };

    // Calculate risk factors using the configuration
    const factors = config.categories.map(category => {
      const value = category.evaluator(context);
      const threshold = category.thresholds.find(t => value <= t.max) || 
                       category.thresholds[category.thresholds.length - 1];
      
      return {
        category: category.name,
        score: threshold.points,
        riskLevel: threshold.risk,
        description: category.description,
        findings: category.findings(context),
        recommendations: category.recommendations(threshold.points, context)
      };
    });

    // Calculate total score and overall risk
    const totalScore = factors.reduce((sum, factor) => sum + factor.score, 0);
    const overallRisk = config.riskLevels.find(level => totalScore <= level.max)?.risk || 'high';

    // Create metrics array for RiskAnalysis interface
    const metrics: RiskMetric[] = factors.map(factor => ({
      name: factor.category,
      score: factor.score,
      description: factor.description,
      severity: factor.riskLevel === 'high' ? 'high' : 
                factor.riskLevel === 'medium' ? 'medium' : 'low',
      recommendations: factor.recommendations
    }));

    return {
      factors,
      totalScore,
      overallRisk,
      summary: `Total Risk Score: ${totalScore}/12 - ${overallRisk.charAt(0).toUpperCase() + overallRisk.slice(1)} Risk`,
      overallScore: totalScore,
      metrics,
      severity: totalScore >= 24 ? 'critical' : 
                totalScore >= 16 ? 'high' :
                totalScore >= 8 ? 'medium' : 'low',
      contextualFactors: context
    };
  }, [compensation, getPercentilePosition, config]);

  // Helper functions for contextual analysis
  const calculateMarketContextScore = (context: any) => {
    let score = 0;
    // Implementation based on market factors
    return score;
  };

  const calculateQualificationsScore = (qualifications: any) => {
    let score = 0;
    // Implementation based on provider qualifications
    return score;
  };

  const calculatePracticePatternScore = (metrics: any) => {
    let score = 0;
    // Implementation based on practice metrics
    return score;
  };

  const calculateProgramValueScore = (value: any) => {
    let score = 0;
    // Implementation based on program value
    return score;
  };

  const determineOverallSeverity = (totalScore: number, metrics: RiskMetric[]): 'low' | 'medium' | 'high' | 'critical' => {
    // Consider both score and context
    if (totalScore >= 9) return 'critical';
    if (totalScore >=6) return 'high';
    if (totalScore >=3) return 'medium';
    return 'low';
  };

  // Add to component state
  const [riskContext, setRiskContext] = useState<RiskFactorContext>({
    market: {
      specialtyDemand: compensation.marketData?.specialtyDemand || 'medium',
      geographicRegion: compensation.marketData?.geographicRegion || '',
      marketCompetition: compensation.marketData?.marketCompetition || 'medium',
      localMarketRates: compensation.marketData?.localMarketRates || 0,
      recruitmentDifficulty: 'medium',
      costOfLiving: 100
    },
    provider: compensation.providerProfile || {
      yearsExperience: 0,
      specialCertifications: [],
      uniqueSkills: []
    },
    practice: {
      caseComplexity: 'medium',
      qualityMetrics: {
        type: 'mixed',
        metrics: [],
        score: 0,
        benchmark: 0
      },
      patientSatisfaction: { score: 0, benchmark: 0 },
      procedureMix: { highComplexity: 0, lowComplexity: 0 }
    },
    program: {
      researchActive: false,
      teachingResponsibilities: false,
      strategicImportance: 'medium'
    }
  });

  return (
    <div className="space-y-8 print:space-y-6 font-inter">
      {/* Enterprise Dashboard Header */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="relative max-w-3xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-light text-gray-900 mb-3">
              {compensation.providerName || 'Provider'}
            </h1>
            
            <div className="mb-4">
              <div className="text-base text-gray-600">
                <span className="font-normal">{compensation.specialty || 'Not Specified'}</span>
              </div>
            </div>

            <div className="mt-4">
              <div className="inline-flex items-center justify-center space-x-3">
                <div className="h-[1px] w-12 bg-blue-200"></div>
                <span className="text-xs font-medium tracking-[0.2em] text-blue-600">FAIR MARKET VALUE ANALYSIS</span>
                <div className="h-[1px] w-12 bg-blue-200"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics - McKinsey Style */}
      <div className="grid grid-cols-3 gap-8 print:gap-6 print:mt-0 print:page-break-after-avoid">
        <div className="border rounded-lg p-6 bg-white">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Total Cash Compensation</h4>
          <div className="text-3xl font-light text-gray-900">${(compensation.total || 0).toLocaleString()}</div>
          <div className="text-sm text-blue-600 font-medium mt-2">
            {getPercentilePosition(compensation.total || 0, 'tcc').toFixed(1)}th percentile
          </div>
        </div>
        <div className="border rounded-lg p-6 bg-white">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Annual wRVUs</h4>
          <div className="text-3xl font-light text-gray-900">{(compensation.wrvus || 0).toLocaleString()}</div>
          <div className="text-sm text-green-600 font-medium mt-2">
            {getPercentilePosition(compensation.wrvus || 0, 'wrvus').toFixed(1)}th percentile
          </div>
        </div>
        <div className="border rounded-lg p-6 bg-white">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Conversion Factor</h4>
          <div className="text-3xl font-light text-gray-900">${(compensation.perWrvu || 0).toFixed(2)}</div>
          <div className="text-sm text-purple-600 font-medium mt-2">
            {getPercentilePosition(compensation.perWrvu || 0, 'conversionFactor').toFixed(1)}th percentile
          </div>
        </div>
      </div>

      {/* Compensation Components */}
      <Card title="Compensation Components" className="print:page-break-inside-avoid">
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-light text-gray-900">Compensation Components</h2>
            <button
              onClick={() => setIsEditingComponents(!isEditingComponents)}
              className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-500 rounded-md border border-blue-200 hover:border-blue-300 transition-colors print:hidden"
            >
              {isEditingComponents ? 'Save' : 'Edit'}
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {/* Base Salary */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Base Salary</h3>
                  {isEditingComponents ? (
                    <div className="mt-2 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="text"
                        value={components.baseTotal.toLocaleString()}
                        onChange={(e) => handleComponentChange('baseTotal', e.target.value)}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-4 py-2 sm:text-sm border-gray-300 rounded-md font-inter"
                      />
                    </div>
                  ) : (
                    <div className="mt-1 text-2xl font-light text-gray-900">${components.baseTotal.toLocaleString()}</div>
                  )}
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* wRVU Incentive */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">wRVU Incentive</h3>
                  {isEditingComponents ? (
                    <div className="mt-2 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="text"
                        value={components.productivityTotal.toLocaleString()}
                        onChange={(e) => handleComponentChange('productivityTotal', e.target.value)}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-4 py-2 sm:text-sm border-gray-300 rounded-md font-inter"
                      />
                    </div>
                  ) : (
                    <div className="mt-1 text-2xl font-light text-gray-900">${components.productivityTotal.toLocaleString()}</div>
                  )}
                </div>
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Call Coverage */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Call Coverage</h3>
                  {isEditingComponents ? (
                    <div className="mt-2 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="text"
                        value={components.callTotal.toLocaleString()}
                        onChange={(e) => handleComponentChange('callTotal', e.target.value)}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-4 py-2 sm:text-sm border-gray-300 rounded-md font-inter"
                      />
                    </div>
                  ) : (
                    <div className="mt-1 text-2xl font-light text-gray-900">${components.callTotal.toLocaleString()}</div>
                  )}
                </div>
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Administrative */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Administrative</h3>
                  {isEditingComponents ? (
                    <div className="mt-2 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="text"
                        value={components.adminTotal.toLocaleString()}
                        onChange={(e) => handleComponentChange('adminTotal', e.target.value)}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-4 py-2 sm:text-sm border-gray-300 rounded-md font-inter"
                      />
                    </div>
                  ) : (
                    <div className="mt-1 text-2xl font-light text-gray-900">${components.adminTotal.toLocaleString()}</div>
                  )}
                </div>
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Total Compensation */}
          <div className="mt-8 border-t pt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Total Compensation</h3>
              <div className="text-3xl font-light text-gray-900">
                ${Object.values(components).reduce((sum, val) => sum + val, 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Market Position Analysis */}
      <Card title="Market Analysis" className="print:page-break-inside-avoid">
        <div className="space-y-8">
          {/* Market Position Visualization */}
          <div>
            <h2 className="text-xl font-light text-gray-900 mb-6">Market Position</h2>
            <div className="space-y-8">
              {/* Total Cash Position */}
              <div>
                <div className="flex justify-between mb-3">
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Cash Compensation</span>
                  <span className="text-sm font-medium text-blue-600 print:text-blue-800">
                    {getPercentilePosition(compensation.total, 'tcc').toFixed(1)}th percentile
                  </span>
                </div>
                <div className="relative">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-100 print:bg-blue-50 print:border print:border-blue-200">
                    <div
                      style={{ width: `${getPercentilePosition(compensation.total, 'tcc')}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 print:bg-blue-700"
                    />
                  </div>
                  {/* Tick marks */}
                  <div className="absolute top-0 w-full">
                    <div className="relative h-2">
                      <div style={{ left: '0%' }} className="absolute w-0.5 h-2 bg-gray-300 print:bg-gray-400" />
                      <div style={{ left: '20%' }} className="absolute w-0.5 h-2 bg-gray-300 print:bg-gray-400" />
                      <div style={{ left: '40%' }} className="absolute w-0.5 h-2 bg-gray-300 print:bg-gray-400" />
                      <div style={{ left: '60%' }} className="absolute w-0.5 h-2 bg-gray-300 print:bg-gray-400" />
                      <div style={{ left: '80%' }} className="absolute w-0.5 h-2 bg-gray-300 print:bg-gray-400" />
                      <div style={{ left: '100%' }} className="absolute w-0.5 h-2 bg-gray-300 print:bg-gray-400" />
                    </div>
                  </div>
                  {/* Percentile labels */}
                  <div className="relative w-full mt-1">
                    <div style={{ left: '0%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400 print:text-gray-600">0</div>
                    <div style={{ left: '20%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400 print:text-gray-600">20th</div>
                    <div style={{ left: '40%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400 print:text-gray-600">40th</div>
                    <div style={{ left: '60%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400 print:text-gray-600">60th</div>
                    <div style={{ left: '80%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400 print:text-gray-600">80th</div>
                    <div style={{ left: '100%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400 print:text-gray-600">100th</div>
                  </div>
                </div>
              </div>

              {/* wRVUs Position */}
              <div>
                <div className="flex justify-between mb-3">
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Annual wRVUs</span>
                  <span className="text-sm font-medium text-green-600 print:text-green-800">
                    {getPercentilePosition(compensation.wrvus, 'wrvus').toFixed(1)}th percentile
                  </span>
                </div>
                <div className="relative">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-green-100 print:bg-green-50 print:border print:border-green-200">
                    <div
                      style={{ width: `${getPercentilePosition(compensation.wrvus, 'wrvus')}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 print:bg-green-700"
                    />
                  </div>
                  {/* Tick marks */}
                  <div className="absolute top-0 w-full">
                    <div className="relative h-2">
                      <div style={{ left: '0%' }} className="absolute w-0.5 h-2 bg-gray-300 print:bg-gray-400" />
                      <div style={{ left: '20%' }} className="absolute w-0.5 h-2 bg-gray-300 print:bg-gray-400" />
                      <div style={{ left: '40%' }} className="absolute w-0.5 h-2 bg-gray-300 print:bg-gray-400" />
                      <div style={{ left: '60%' }} className="absolute w-0.5 h-2 bg-gray-300 print:bg-gray-400" />
                      <div style={{ left: '80%' }} className="absolute w-0.5 h-2 bg-gray-300 print:bg-gray-400" />
                      <div style={{ left: '100%' }} className="absolute w-0.5 h-2 bg-gray-300 print:bg-gray-400" />
                    </div>
                  </div>
                  {/* Percentile labels */}
                  <div className="relative w-full mt-1">
                    <div style={{ left: '0%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400 print:text-gray-600">0</div>
                    <div style={{ left: '20%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400 print:text-gray-600">20th</div>
                    <div style={{ left: '40%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400 print:text-gray-600">40th</div>
                    <div style={{ left: '60%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400 print:text-gray-600">60th</div>
                    <div style={{ left: '80%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400 print:text-gray-600">80th</div>
                    <div style={{ left: '100%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400 print:text-gray-600">100th</div>
                  </div>
                </div>
              </div>

              {/* Conversion Factor Position */}
              <div>
                <div className="flex justify-between mb-3">
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Conversion Factor</span>
                  <span className="text-sm font-medium text-purple-600 print:text-purple-800">
                    {getPercentilePosition(compensation.perWrvu, 'conversionFactor').toFixed(1)}th percentile
                  </span>
                </div>
                <div className="relative">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-purple-100 print:bg-purple-50 print:border print:border-purple-200">
                    <div
                      style={{ width: `${getPercentilePosition(compensation.perWrvu, 'conversionFactor')}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500 print:bg-purple-700"
                    />
                  </div>
                  {/* Tick marks */}
                  <div className="absolute top-0 w-full">
                    <div className="relative h-2">
                      <div style={{ left: '0%' }} className="absolute w-0.5 h-2 bg-gray-300 print:bg-gray-400" />
                      <div style={{ left: '20%' }} className="absolute w-0.5 h-2 bg-gray-300 print:bg-gray-400" />
                      <div style={{ left: '40%' }} className="absolute w-0.5 h-2 bg-gray-300 print:bg-gray-400" />
                      <div style={{ left: '60%' }} className="absolute w-0.5 h-2 bg-gray-300 print:bg-gray-400" />
                      <div style={{ left: '80%' }} className="absolute w-0.5 h-2 bg-gray-300 print:bg-gray-400" />
                      <div style={{ left: '100%' }} className="absolute w-0.5 h-2 bg-gray-300 print:bg-gray-400" />
                    </div>
                  </div>
                  {/* Percentile labels */}
                  <div className="relative w-full mt-1">
                    <div style={{ left: '0%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400 print:text-gray-600">0</div>
                    <div style={{ left: '20%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400 print:text-gray-600">20th</div>
                    <div style={{ left: '40%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400 print:text-gray-600">40th</div>
                    <div style={{ left: '60%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400 print:text-gray-600">60th</div>
                    <div style={{ left: '80%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400 print:text-gray-600">80th</div>
                    <div style={{ left: '100%' }} className="absolute transform -translate-x-1/2 text-xs text-gray-400 print:text-gray-600">100th</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Market Benchmarks Table */}
          <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-light text-gray-900">Market Benchmarks</h2>
              <button
                onClick={() => setIsEditingBenchmarks(!isEditingBenchmarks)}
                className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-500 rounded-md border border-blue-200 hover:border-blue-300 transition-colors print:hidden"
              >
                {isEditingBenchmarks ? 'Save' : 'Edit'}
              </button>
            </div>
            <div className="overflow-hidden border rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 font-inter text-sm">
                <thead className="bg-gray-50 print:bg-gray-100">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Metric
                    </th>
                    {benchmarks.map(b => (
                      <th key={b.percentile} scope="col" className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {b.percentile}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      Total Cash Compensation
                    </td>
                    {benchmarks
                      .slice()
                      .map((b, index) => (
                        <td key={b.percentile} className="px-2 py-2 whitespace-nowrap text-sm text-right">
                          {isEditingBenchmarks ? (
                            <input
                              type="text"
                              value={(b.tcc || 0).toLocaleString()}
                              onChange={(e) => handleBenchmarkChange(index, 'tcc', e.target.value.replace(/,/g, ''))}
                              className="w-24 text-right border rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500 text-sm font-inter"
                            />
                          ) : (
                            <span className="font-medium text-gray-900">${(b.tcc || 0).toLocaleString()}</span>
                          )}
                        </td>
                      ))}
                  </tr>
                  <tr>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      Annual wRVUs
                    </td>
                    {benchmarks
                      .slice()
                      .map((b, index) => (
                        <td key={b.percentile} className="px-2 py-2 whitespace-nowrap text-sm text-right">
                          {isEditingBenchmarks ? (
                            <input
                              type="text"
                              value={(b.wrvus || 0).toLocaleString()}
                              onChange={(e) => handleBenchmarkChange(index, 'wrvus', e.target.value.replace(/,/g, ''))}
                              className="w-20 text-right border rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500 text-sm font-inter"
                            />
                          ) : (
                            <span className="font-medium text-gray-900">{(b.wrvus || 0).toLocaleString()}</span>
                          )}
                        </td>
                      ))}
                  </tr>
                  <tr>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      Conversion Factor
                    </td>
                    {benchmarks
                      .slice()
                      .map((b, index) => (
                        <td key={b.percentile} className="px-2 py-2 whitespace-nowrap text-sm text-right">
                          {isEditingBenchmarks ? (
                            <div className="relative inline-block">
                              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">$</span>
                              </div>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={b.conversionFactor || 0}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                                    handleBenchmarkChange(index, 'conversionFactor', value);
                                  }
                                }}
                                className="w-20 text-right pl-6 border rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500 text-sm font-inter"
                              />
                            </div>
                          ) : (
                            <span className="font-medium text-gray-900">${(b.conversionFactor || 0).toFixed(2)}</span>
                          )}
                        </td>
                      ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>

      {/* Risk Analysis Section */}
      <Card title="Risk Analysis" className="print:page-break-inside-avoid">
        <RiskAnalysisSection 
          analysis={calculateRiskAnalysis} 
          riskRules={riskRules}
          setRiskRules={setRiskRules}
          context={riskContext}
          onContextUpdate={setRiskContext}
          onRuleChange={handleRuleChange}
          onAdjustmentAdd={handleAdjustmentAdd}
        />
      </Card>
    </div>
  );
};

// Add RiskFactorEditor component
const RiskFactorEditor: React.FC<RiskFactorEditorProps> = ({ context, onContextChange }) => {
  const [selectedScore, setSelectedScore] = useState<0 | 1 | 2 | 3>(context.practice.qualityMetrics.type === 'objective' ? 0 : context.practice.qualityMetrics.type === 'subjective' ? 1 : 2);
  const [editedFindings, setEditedFindings] = useState<string[]>(context.practice.qualityMetrics.metrics.map(m => m.name));
  const [editedRecommendations, setEditedRecommendations] = useState<string[]>(context.practice.qualityMetrics.metrics.map(m => m.name));

  const handleSave = () => {
    onContextChange({
      ...context,
      practice: {
        ...context.practice,
        qualityMetrics: {
          ...context.practice.qualityMetrics,
          type: selectedScore === 0 ? 'objective' : selectedScore === 1 ? 'subjective' : 'mixed',
          metrics: context.practice.qualityMetrics.metrics.map(m => ({
            ...m,
            actual: selectedScore === 0 ? m.target : selectedScore === 1 ? m.actual : m.actual
          }))
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-4/5 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">{context.practice.qualityMetrics.type === 'objective' ? 'Objective' : context.practice.qualityMetrics.type === 'subjective' ? 'Subjective' : 'Mixed'} Quality Metrics</h3>
          <button onClick={() => onContextChange(context)} className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Risk Score Selection */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Risk Assessment</h4>
            <div className="space-y-4">
              {riskOptions['Compensation Level Risk'].map((option) => (
                <div
                  key={option.score}
                  className={`relative flex items-start p-4 cursor-pointer rounded-lg border ${
                    selectedScore === option.score 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedScore(option.score)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {option.label}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      {option.description}
                    </div>
                  </div>
                  <div className="ml-3 flex items-center h-5">
                    <input
                      type="radio"
                      checked={selectedScore === option.score}
                      onChange={() => setSelectedScore(option.score)}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Findings */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">Findings</h4>
            <div className="space-y-2">
              {editedFindings.map((finding, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={finding}
                    onChange={(e) => {
                      const newFindings = [...editedFindings];
                      newFindings[index] = e.target.value;
                      setEditedFindings(newFindings);
                    }}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      const newFindings = editedFindings.filter((_, i) => i !== index);
                      setEditedFindings(newFindings);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                onClick={() => setEditedFindings([...editedFindings, ''])}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Add Finding
              </button>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">Recommendations</h4>
            <div className="space-y-2">
              {editedRecommendations.map((recommendation, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={recommendation}
                    onChange={(e) => {
                      const newRecommendations = [...editedRecommendations];
                      newRecommendations[index] = e.target.value;
                      setEditedRecommendations(newRecommendations);
                    }}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      const newRecommendations = editedRecommendations.filter((_, i) => i !== index);
                      setEditedRecommendations(newRecommendations);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                onClick={() => setEditedRecommendations([...editedRecommendations, ''])}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Add Recommendation
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => onContextChange(context)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Update RiskAnalysisSection to handle the updated editor
const RiskAnalysisSection: React.FC<{
  analysis: RiskAnalysis;
  riskRules: RiskScoreRule[];
  setRiskRules: (rules: RiskScoreRule[]) => void;
  context: RiskFactorContext;
  onContextUpdate: (context: RiskFactorContext) => void;
  onRuleChange: (ruleId: string, updates: Partial<RiskScoreRule>) => void;
  onAdjustmentAdd: (adjustment: RiskScoreAdjustment) => void;
}> = ({ analysis, riskRules, setRiskRules, context, onContextUpdate, onRuleChange, onAdjustmentAdd }) => {
  const [selectedFactor, setSelectedFactor] = useState<RiskFactor | null>(null);
  const [factors, setFactors] = useState<RiskFactor[]>(analysis.factors.map(factor => ({
    ...factor,
    score: factor.score as 0 | 1 | 2 | 3,
    riskLevel: factor.riskLevel as 'low' | 'medium' | 'high'
  })));
  const [totalScore, setTotalScore] = useState(analysis.totalScore);

  // Calculate risk level based on total score
  const calculateRiskLevel = (score: number): 'low' | 'medium' | 'high' | 'critical' => {
    if (score >= 9) return 'critical';
    if (score >= 6) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
  };

  // Update total score whenever factors change
  useEffect(() => {
    const newTotalScore = factors.reduce((sum, factor) => sum + factor.score, 0);
    setTotalScore(newTotalScore);
  }, [factors]);

  const handleFactorUpdate = (score: 0 | 1 | 2 | 3, findings: string[], recommendations: string[]) => {
    if (!selectedFactor) return;
    
    const updatedFactors = factors.map(f => 
      f.category === selectedFactor.category 
        ? { 
            ...f, 
            score,
            findings,
            recommendations,
            riskLevel: score <= 1 ? 'low' : score <= 2 ? 'medium' : 'high'
          }
        : f
    );
    setFactors(updatedFactors);
    setSelectedFactor(null);
  };

  const renderFactorContent = (factor: RiskFactor) => {
    const riskLevelClass = factor.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
      factor.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
      'bg-green-100 text-green-800';

    return (
      <div 
        className="cursor-pointer group hover:bg-gray-50 transition-colors duration-150"
        onClick={() => setSelectedFactor(factor)}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">{factor.category}</h3>
            <p className="text-sm text-gray-600">{factor.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`px-2 py-1 rounded-full text-sm font-medium ${riskLevelClass}`}>
              {factor.score} Points
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Findings:</h4>
            <ul className="mt-1 list-disc list-inside text-sm text-gray-600">
              {factor.findings.map((finding, i) => (
                <li key={i}>{finding}</li>
              ))}
            </ul>
          </div>
          {factor.recommendations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900">Recommendations:</h4>
              <ul className="mt-1 list-disc list-inside text-sm text-gray-600">
                {factor.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-light text-gray-900">FMV Risk Analysis</h2>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          calculateRiskLevel(totalScore) === 'critical' ? 'bg-red-100 text-red-800' :
          calculateRiskLevel(totalScore) === 'high' ? 'bg-orange-100 text-orange-800' :
          calculateRiskLevel(totalScore) === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {calculateRiskLevel(totalScore).charAt(0).toUpperCase() + calculateRiskLevel(totalScore).slice(1)} Risk
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {factors.map(factor => (
          <div 
            key={factor.category} 
            className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-150 hover:border-blue-200"
          >
            {renderFactorContent(factor)}
          </div>
        ))}
      </div>

      {selectedFactor && (
        <RiskModal
          isOpen={true}
          onClose={() => setSelectedFactor(null)}
          title={selectedFactor.category}
          description={selectedFactor.description}
          findings={selectedFactor.findings}
          recommendations={selectedFactor.recommendations}
          score={selectedFactor.score}
          onUpdate={handleFactorUpdate}
          riskOptions={riskOptions[selectedFactor.category]}
        />
      )}

      <div className="border-t pt-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Overall Assessment</h3>
            <p className="text-sm text-gray-600">Based on comprehensive analysis of all risk factors</p>
          </div>
          <div className="text-2xl font-light text-gray-900">
            {totalScore} / 12
          </div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-4">
          <div className={`p-3 rounded-lg border ${
            calculateRiskLevel(totalScore) === 'low' ? 'bg-green-50 border-green-200 ring-2 ring-green-500' : 'bg-green-50 border-green-200'
          }`}>
            <div className="text-sm font-medium text-green-800">Low Risk (0-3)</div>
            <div className="text-xs text-green-600">Aligned with market standards</div>
          </div>
          <div className={`p-3 rounded-lg border ${
            calculateRiskLevel(totalScore) === 'medium' ? 'bg-yellow-50 border-yellow-200 ring-2 ring-yellow-500' : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="text-sm font-medium text-yellow-800">Medium Risk (4-6)</div>
            <div className="text-xs text-yellow-600">Additional documentation needed</div>
          </div>
          <div className={`p-3 rounded-lg border ${
            calculateRiskLevel(totalScore) === 'high' ? 'bg-orange-50 border-orange-200 ring-2 ring-orange-500' : 'bg-orange-50 border-orange-200'
          }`}>
            <div className="text-sm font-medium text-orange-800">High Risk (7-9)</div>
            <div className="text-xs text-orange-600">Requires thorough justification</div>
          </div>
          <div className={`p-3 rounded-lg border ${
            calculateRiskLevel(totalScore) === 'critical' ? 'bg-red-50 border-red-200 ring-2 ring-red-500' : 'bg-red-50 border-red-200'
          }`}>
            <div className="text-sm font-medium text-red-800">Critical Risk (10-12)</div>
            <div className="text-xs text-red-600">Immediate review required</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add RiskOption interface
interface RiskOption {
  label: string;
  description: string;
  score: 0 | 1 | 2 | 3;
}

// Add riskOptions definition
const riskOptions: Record<string, RiskOption[]> = {
  'Clinical Compensation Risk': [
    { 
      label: 'Low Risk (0 points)', 
      description: 'Compensation below 50th percentile with matching productivity',
      score: 0 
    },
    { 
      label: 'Low-Medium Risk (1 point)', 
      description: '50th-75th percentile with supporting productivity',
      score: 1 
    },
    { 
      label: 'Medium Risk (2 points)', 
      description: '75th-90th percentile or misaligned productivity',
      score: 2 
    },
    { 
      label: 'High Risk (3 points)', 
      description: 'Above 90th percentile or significantly misaligned productivity',
      score: 3 
    }
  ],
  'Market Factors Risk': [
    {
      label: 'Low Risk (0 points)',
      description: 'Low demand specialty, low competition',
      score: 0
    },
    {
      label: 'Low-Medium Risk (1 point)',
      description: 'Medium demand or moderate competition',
      score: 1
    },
    {
      label: 'Medium Risk (2 points)',
      description: 'High demand or high competition',
      score: 2
    },
    {
      label: 'High Risk (3 points)',
      description: 'High demand with high competition',
      score: 3
    }
  ],
  'Documentation Risk': [
    {
      label: 'Low Risk (0 points)',
      description: 'Complete documentation with recent review',
      score: 0
    },
    {
      label: 'Low-Medium Risk (1 point)',
      description: 'Minor gaps in documentation',
      score: 1
    },
    {
      label: 'Medium Risk (2 points)',
      description: 'Significant documentation gaps',
      score: 2
    },
    {
      label: 'High Risk (3 points)',
      description: 'Major documentation deficiencies',
      score: 3
    }
  ],
  'Structural Risk': [
    {
      label: 'Low Risk (0 points)',
      description: 'Balanced compensation structure with appropriate incentives',
      score: 0
    },
    {
      label: 'Low-Medium Risk (1 point)',
      description: 'Mostly balanced with minor concerns',
      score: 1
    },
    {
      label: 'Medium Risk (2 points)',
      description: 'Imbalanced structure or misaligned incentives',
      score: 2
    },
    {
      label: 'High Risk (3 points)',
      description: 'Highly imbalanced or inappropriate structure',
      score: 3
    }
  ]
};

interface RiskModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  findings: string[];
  recommendations: string[];
  score: 0 | 1 | 2 | 3;
  onUpdate: (score: 0 | 1 | 2 | 3, findings: string[], recommendations: string[]) => void;
  riskOptions: RiskOption[];
}

const RiskModal: React.FC<RiskModalProps> = ({ 
  isOpen, 
  onClose, 
  title,
  description,
  findings, 
  recommendations, 
  score,
  onUpdate,
  riskOptions
}) => {
  const [selectedScore, setSelectedScore] = useState<0 | 1 | 2 | 3>(score);
  const [editedFindings, setEditedFindings] = useState<string[]>(findings);
  const [editedRecommendations, setEditedRecommendations] = useState<string[]>(recommendations);

  const handleSave = () => {
    onUpdate(selectedScore, editedFindings, editedRecommendations);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-4/5 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Risk Score Selection */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Risk Assessment</h4>
            <div className="space-y-4">
              {riskOptions.map((option) => (
                <div
                  key={option.score}
                  className={`relative flex items-start p-4 cursor-pointer rounded-lg border ${
                    selectedScore === option.score 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedScore(option.score)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {option.label}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      {option.description}
                    </div>
                  </div>
                  <div className="ml-3 flex items-center h-5">
                    <input
                      type="radio"
                      checked={selectedScore === option.score}
                      onChange={() => setSelectedScore(option.score)}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Findings */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">Findings</h4>
            <div className="space-y-2">
              {editedFindings.map((finding, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={finding}
                    onChange={(e) => {
                      const newFindings = [...editedFindings];
                      newFindings[index] = e.target.value;
                      setEditedFindings(newFindings);
                    }}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      const newFindings = editedFindings.filter((_, i) => i !== index);
                      setEditedFindings(newFindings);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                onClick={() => setEditedFindings([...editedFindings, ''])}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Add Finding
              </button>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">Recommendations</h4>
            <div className="space-y-2">
              {editedRecommendations.map((recommendation, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={recommendation}
                    onChange={(e) => {
                      const newRecommendations = [...editedRecommendations];
                      newRecommendations[index] = e.target.value;
                      setEditedRecommendations(newRecommendations);
                    }}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      const newRecommendations = editedRecommendations.filter((_, i) => i !== index);
                      setEditedRecommendations(newRecommendations);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                onClick={() => setEditedRecommendations([...editedRecommendations, ''])}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Add Recommendation
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

type ReferralImpact = 'none' | 'low' | 'medium' | 'high';

interface RiskFactorEditorProps {
  context: RiskFactorContext;
  onContextChange: (context: RiskFactorContext) => void;
}

const handleRiskFactorUpdate = (
  updatedContext: RiskFactorContext,
  score: number,
  findings: string[],
  recommendations: string[]
): void => {
  // Implementation
};

const handleRuleUpdate = (ruleId: string, updates: Partial<RiskScoreRule>): void => {
  // Implementation
};

const updateRiskFactors = (factors: RiskFactor[]): void => {
  setRiskFactors(factors.map(factor => ({
    ...factor,
    riskLevel: factor.riskLevel as 'low' | 'medium' | 'high'
  })));
};

export default CompensationAnalysis; 