// src/components/CompensationForm.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card } from './ui/Card';
import CompensationAnalysis from './CompensationAnalysis';
import { calculateCompensationMetrics } from '../utils/calculations';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Tooltip } from './ui/ui-components';
import { DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';

interface CompensationFormData {
  // Base Salary Components
  clinicalBase: number;
  teachingBase: number;
  researchBase: number;
  adminBase: number;

  // Productivity Components
  wrvus: number;
  wrvuRate: number;
  qualityBonus: number;
  patientSatisfactionBonus: number;

  // Call Coverage
  weekdayCallShifts: number;
  weekendCallShifts: number;
  callPayRate: number;

  // Administrative/Leadership
  deptChairStipend: number;
  medicalDirectorStipend: number;
  committeeStipend: number;
  leadershipHours: number;
  leadershipRate: number;
}

interface CompensationFormProps {
  specialty: string;
  providerId: string;
}

const CompensationForm = ({ specialty, providerId }: CompensationFormProps) => {
  const { register, handleSubmit, watch } = useForm<CompensationFormData>({
    defaultValues: {
      clinicalBase: 0,
      teachingBase: 0,
      researchBase: 0,
      adminBase: 0,
      wrvus: 0,
      wrvuRate: 65, // Default wRVU rate
      qualityBonus: 0,
      patientSatisfactionBonus: 0,
      weekdayCallShifts: 0,
      weekendCallShifts: 0,
      callPayRate: 0,
      deptChairStipend: 0,
      medicalDirectorStipend: 0,
      committeeStipend: 0,
      leadershipHours: 0,
      leadershipRate: 150, // Default leadership hourly rate
    }
  });

  const [analysisData, setAnalysisData] = useState<any>(null);
  const [marketData, setMarketData] = useState<any>(null);
  const navigate = useNavigate();

  const handleMarketDataUpload = (data: any[]) => {
    // Find the matching specialty data
    const specialtyData = data.find(d => d.specialty.toLowerCase() === specialty.toLowerCase());
    if (specialtyData) {
      // Transform the data into the format needed for benchmarks
      const benchmarks = [
        {
          percentile: '25th',
          tcc: specialtyData.p25_total,
          clinicalFte: 1.0,
          wrvus: specialtyData.p25_wrvu,
          conversionFactor: specialtyData.p25_cf,
          callRate: 1000,
          adminRate: 150
        },
        {
          percentile: '50th',
          tcc: specialtyData.p50_total,
          clinicalFte: 1.0,
          wrvus: specialtyData.p50_wrvu,
          conversionFactor: specialtyData.p50_cf,
          callRate: 1200,
          adminRate: 175
        },
        {
          percentile: '75th',
          tcc: specialtyData.p75_total,
          clinicalFte: 1.0,
          wrvus: specialtyData.p75_wrvu,
          conversionFactor: specialtyData.p75_cf,
          callRate: 1400,
          adminRate: 200
        },
        {
          percentile: '90th',
          tcc: specialtyData.p90_total,
          clinicalFte: 1.0,
          wrvus: specialtyData.p90_wrvu,
          conversionFactor: specialtyData.p90_cf,
          callRate: 1600,
          adminRate: 225
        }
      ];
      console.log('Transformed benchmarks:', benchmarks);
      setMarketData(benchmarks);
      localStorage.setItem('marketData', JSON.stringify([{ specialty, benchmarks }]));
    }
  };

  const onSubmit = (data: CompensationFormData) => {
    console.log('Form data:', data);

    // Calculate base compensation
    const baseTotal = data.clinicalBase + data.teachingBase + data.researchBase + data.adminBase;
    
    // Calculate productivity compensation
    const wrvuCompensation = data.wrvus * data.wrvuRate;
    const bonusCompensation = data.qualityBonus + data.patientSatisfactionBonus;
    const productivityTotal = wrvuCompensation + bonusCompensation;
    
    // Calculate call coverage (monthly shifts * rate * 12 months)
    const totalCallPay = (data.weekdayCallShifts + data.weekendCallShifts) * data.callPayRate * 12;
    
    // Calculate administrative/leadership compensation
    const leadershipPay = data.leadershipHours * data.leadershipRate * 52; // Annualized
    const adminStipends = data.deptChairStipend + data.medicalDirectorStipend + data.committeeStipend;
    const adminTotal = leadershipPay + adminStipends;
    
    const totalCompensation = baseTotal + productivityTotal + totalCallPay + adminTotal;

    console.log('Calculated totals:', {
      baseTotal,
      productivityTotal,
      totalCallPay,
      adminTotal,
      totalCompensation
    });

    const components = [
      {
        id: '1',
        type: 'base',
        name: 'Clinical Base Pay',
        description: 'Base salary for clinical work',
        amount: baseTotal,
        fte: data.clinicalFte || 1.0,
        wrvus: 0
      },
      {
        id: '2',
        type: 'wrvu',
        name: 'wRVU Incentive',
        description: 'Productivity-based compensation',
        amount: wrvuCompensation,
        fte: data.clinicalFte || 1.0,
        wrvus: data.wrvus,
        conversion_factor: data.wrvuRate
      },
      {
        id: '3',
        type: 'quality',
        name: 'Quality & Satisfaction',
        description: 'Quality metrics and patient satisfaction bonuses',
        amount: bonusCompensation,
        fte: 1.0,
        wrvus: 0
      },
      {
        id: '4',
        type: 'call',
        name: 'Call Coverage',
        description: 'Call coverage compensation',
        amount: totalCallPay,
        fte: 1.0,
        wrvus: 0
      },
      {
        id: '5',
        type: 'admin',
        name: 'Administrative',
        description: 'Administrative and leadership compensation',
        amount: adminTotal,
        fte: data.adminFte || 0.2,
        wrvus: 0
      }
    ];

    console.log('Saving components:', components);

    const result = {
      provider: {
        name: providerId,
        specialty: specialty,
        components: components,
        marketData: {
          specialtyDemand: 'medium',
          geographicRegion: 'National',
          marketCompetition: 'medium',
          localMarketRates: totalCompensation,
          recruitmentDifficulty: 'medium',
          costOfLiving: 100
        },
        providerProfile: {
          yearsExperience: data.yearsExperience || 0,
          specialCertifications: [],
          uniqueSkills: []
        },
        qualityMetrics: {
          type: 'objective',
          metrics: []
        },
        documentation: {
          methodology: 'Standard methodology applied',
          supportingDocs: ['Market Data'],
          lastReviewDate: new Date().toISOString().split('T')[0]
        },
        compliance: {
          starkCompliance: true,
          aksPolicies: true,
          referralAnalysis: {
            hasReferralConnection: false,
            referralImpact: 'none'
          }
        },
        businessCase: {
          needJustification: 'Market competitive compensation',
          strategicAlignment: 'Aligned with organizational goals',
          financialImpact: {
            revenue: 0,
            expenses: totalCompensation,
            roi: 0
          }
        }
      }
    };

    localStorage.setItem('compensationResults', JSON.stringify(result));
    navigate('/results');
  };

  return (
    <div className="space-y-6">
      <Card title="Provider Compensation">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Base Salary Components */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Base Salary Components</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Clinical Base Salary
                  <span className="ml-1 text-xs text-gray-500">(Core clinical practice compensation)</span>
                </label>
                <input
                  type="number"
                  {...register('clinicalBase')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Teaching Base
                  <span className="ml-1 text-xs text-gray-500">(Academic/teaching responsibilities)</span>
                </label>
                <input
                  type="number"
                  {...register('teachingBase')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Research Base
                  <span className="ml-1 text-xs text-gray-500">(Protected research time)</span>
                </label>
                <input
                  type="number"
                  {...register('researchBase')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Administrative Base
                  <span className="ml-1 text-xs text-gray-500">(Base administrative duties)</span>
                </label>
                <input
                  type="number"
                  {...register('adminBase')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Productivity Components */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Productivity & Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Work RVUs
                  <span className="ml-1 text-xs text-gray-500">(Annual work relative value units)</span>
                </label>
                <input
                  type="number"
                  {...register('wrvus')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  wRVU Rate
                  <span className="ml-1 text-xs text-gray-500">($ per wRVU)</span>
                </label>
                <input
                  type="number"
                  {...register('wrvuRate')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Quality Metrics Bonus
                  <span className="ml-1 text-xs text-gray-500">(Annual quality performance bonus)</span>
                </label>
                <input
                  type="number"
                  {...register('qualityBonus')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Patient Satisfaction Bonus
                  <span className="ml-1 text-xs text-gray-500">(Patient experience incentive)</span>
                </label>
                <input
                  type="number"
                  {...register('patientSatisfactionBonus')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Call Coverage */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Call Coverage</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Weekday Call Shifts
                  <span className="ml-1 text-xs text-gray-500">(Shifts per month)</span>
                </label>
                <input
                  type="number"
                  {...register('weekdayCallShifts')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Weekend Call Shifts
                  <span className="ml-1 text-xs text-gray-500">(Shifts per month)</span>
                </label>
                <input
                  type="number"
                  {...register('weekendCallShifts')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Call Pay Rate
                  <span className="ml-1 text-xs text-gray-500">($ per shift)</span>
                </label>
                <input
                  type="number"
                  {...register('callPayRate')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Administrative/Leadership */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Administrative & Leadership</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Department Chair Stipend
                  <span className="ml-1 text-xs text-gray-500">(Annual)</span>
                </label>
                <input
                  type="number"
                  {...register('deptChairStipend')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Medical Director Stipend
                  <span className="ml-1 text-xs text-gray-500">(Annual)</span>
                </label>
                <input
                  type="number"
                  {...register('medicalDirectorStipend')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Committee Participation
                  <span className="ml-1 text-xs text-gray-500">(Annual stipends)</span>
                </label>
                <input
                  type="number"
                  {...register('committeeStipend')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Leadership Hours
                  <span className="ml-1 text-xs text-gray-500">(Hours per week)</span>
                </label>
                <input
                  type="number"
                  {...register('leadershipHours')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Leadership Rate
                  <span className="ml-1 text-xs text-gray-500">($ per hour)</span>
                </label>
                <input
                  type="number"
                  {...register('leadershipRate')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Calculate Total Compensation
          </button>
        </form>
      </Card>

      {analysisData && <CompensationAnalysis {...analysisData} />}
    </div>
  );
};

export default CompensationForm;