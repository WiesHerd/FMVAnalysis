import React from 'react';
import { Card, Descriptions, Tag, Space, Typography, Divider } from 'antd';
import type { FMVRiskAnalysis, RiskLevel } from '../types/fmvRiskAnalysis';

const { Title, Text } = Typography;

interface FMVRiskAnalysisProps {
  analysis: FMVRiskAnalysis;
  onUpdate?: (updates: Partial<FMVRiskAnalysis>) => void;
}

const getRiskColor = (level: RiskLevel): string => {
  switch (level) {
    case 'low':
      return 'success';
    case 'medium':
      return 'warning';
    case 'high':
      return 'error';
    case 'critical':
      return 'magenta';
    default:
      return 'default';
  }
};

const FMVRiskAnalysisComponent: React.FC<FMVRiskAnalysisProps> = ({
  analysis,
  onUpdate
}) => {
  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Title level={4} className="!mb-1">FMV Risk Analysis</Title>
            <Text type="secondary">Last updated: {analysis.analysisDate} by {analysis.analyst}</Text>
          </div>
          <Tag color={getRiskColor(analysis.overallRisk)} className="text-base px-3 py-1">
            {analysis.overallRisk.toUpperCase()} RISK
          </Tag>
        </div>

        <Divider />

        {/* Compensation Risk Section */}
        <div className="mb-8">
          <Title level={5}>Clinical Compensation Risk</Title>
          <Descriptions column={2} className="mb-4">
            <Descriptions.Item label="Total Compensation Percentile">
              {analysis.compensationAnalysis.factors.totalCompensationPercentile}th
            </Descriptions.Item>
            <Descriptions.Item label="Productivity Percentile">
              {analysis.compensationAnalysis.factors.productivityPercentile}th
            </Descriptions.Item>
            <Descriptions.Item label="Base Compensation Ratio">
              {analysis.compensationAnalysis.factors.baseCompensationRatio}%
            </Descriptions.Item>
            <Descriptions.Item label="Call Coverage Alignment">
              {analysis.compensationAnalysis.factors.callCoverageAlignment}%
            </Descriptions.Item>
          </Descriptions>

          <Space direction="vertical" className="w-full">
            <Text strong>Findings:</Text>
            <ul className="list-disc pl-5">
              {analysis.compensationAnalysis.findings.map((finding, index) => (
                <li key={index}>{finding}</li>
              ))}
            </ul>
          </Space>
        </div>

        {/* Market Factors Risk Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <Title level={5}>Market Factors Risk</Title>
            <Text strong className="text-green-600">0 Points</Text>
          </div>
          <Text type="secondary" className="mb-4">Analysis of market conditions and specialty demand</Text>
          
          <Space direction="vertical" className="w-full">
            <Text strong>Findings:</Text>
            <ul className="list-disc pl-5">
              <li>Specialty demand: {analysis.marketAnalysis.factors.specialtyDemand}</li>
              <li>Competition level: {analysis.marketAnalysis.factors.competitionLevel}</li>
              <li>Geographic region: {analysis.marketAnalysis.factors.geographicFactors.setting}</li>
              <li>Recruitment difficulty: {analysis.marketAnalysis.factors.physicianShortage ? 'high' : 'normal'}</li>
              <li>Practice type: {analysis.marketAnalysis.factors.practiceType}</li>
            </ul>

            <Text strong className="mt-4">Recommendations:</Text>
            <ul className="list-disc pl-5">
              <li>Continue monitoring market conditions</li>
            </ul>
          </Space>
        </div>

        {/* Documentation Risk Section */}
        <div className="mb-8">
          <Title level={5}>Documentation Risk ({analysis.documentationAnalysis.score} Points)</Title>
          <Space direction="vertical" className="w-full mb-4">
            <Text strong>Missing FMV Elements:</Text>
            <ul className="list-disc pl-5">
              {Object.entries(analysis.documentationAnalysis.factors.fmvElements)
                .filter(([_, present]) => !present)
                .slice(0, 5)
                .map(([key]) => (
                  <li key={key} className="text-amber-500">
                    <span>⚠️ Missing: {key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </li>
                ))}
            </ul>
            
            <Text strong className="mt-4">Missing Supporting Documents:</Text>
            <ul className="list-disc pl-5">
              {Object.entries(analysis.documentationAnalysis.factors.supportingDocuments)
                .filter(([_, present]) => !present)
                .slice(0, 5)
                .map(([key]) => (
                  <li key={key} className="text-amber-500">
                    <span>⚠️ Missing: {key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </li>
                ))}
            </ul>
          </Space>

          {analysis.documentationAnalysis.recommendations.length > 0 && (
            <Space direction="vertical" className="w-full">
              <Text strong>Key Recommendations:</Text>
              <ul className="list-disc pl-5">
                {analysis.documentationAnalysis.recommendations
                  .filter(Boolean)
                  .map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
              </ul>
            </Space>
          )}
        </div>

        {/* Compliance Risk Section */}
        <div className="mb-8">
          <Title level={5}>Compliance Risk</Title>
          <Descriptions column={2} className="mb-4">
            <Descriptions.Item label="Stark Law">
              <Tag color={analysis.complianceAnalysis.factors.starkLaw.status === 'compliant' ? 'success' : 'error'}>
                {analysis.complianceAnalysis.factors.starkLaw.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Anti-Kickback">
              <Tag color={analysis.complianceAnalysis.factors.antiKickback.status === 'compliant' ? 'success' : 'error'}>
                {analysis.complianceAnalysis.factors.antiKickback.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Commercial Reasonableness">
              <Tag color={analysis.complianceAnalysis.factors.commercialReasonableness.status === 'compliant' ? 'success' : 'error'}>
                {analysis.complianceAnalysis.factors.commercialReasonableness.status}
              </Tag>
            </Descriptions.Item>
          </Descriptions>

          <Space direction="vertical" className="w-full">
            <Text strong>Findings:</Text>
            <ul className="list-disc pl-5">
              {analysis.complianceAnalysis.findings.map((finding, index) => (
                <li key={index}>{finding}</li>
              ))}
            </ul>
          </Space>
        </div>

        <Divider />

        {/* Summary Section */}
        <div>
          <Title level={5}>Overall Assessment</Title>
          <Text>{analysis.summary}</Text>
        </div>

        {/* Review History */}
        <div className="mt-8">
          <Title level={5}>Review History</Title>
          <ul className="list-none p-0">
            {analysis.reviewHistory.map((review, index) => (
              <li key={index} className="mb-4 pb-4 border-b last:border-b-0">
                <Text strong>{review.date} - {review.reviewer}</Text>
                <ul className="list-disc pl-5 mt-2">
                  {review.changes.map((change, changeIndex) => (
                    <li key={changeIndex}>{change}</li>
                  ))}
                </ul>
                {review.notes && (
                  <Text italic className="block mt-2">{review.notes}</Text>
                )}
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default FMVRiskAnalysisComponent; 