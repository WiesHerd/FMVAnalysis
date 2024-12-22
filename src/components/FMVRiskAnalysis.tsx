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

        {/* Compensation Structure Section */}
        <div className="mb-8">
          <Title level={5}>Compensation Structure</Title>
          <Text type="secondary" className="mb-4">Assessment of compensation consistency with market value considering specialty, experience, location, and demand</Text>
          
          <Descriptions column={2} className="mb-4">
            <Descriptions.Item label="Total Compensation Percentile">
              {analysis.compensationAnalysis.factors.totalCompensationPercentile}th
            </Descriptions.Item>
            <Descriptions.Item label="Geographic Region">
              {analysis.marketAnalysis.factors.geographicFactors.region}
            </Descriptions.Item>
            <Descriptions.Item label="Specialty Demand">
              {analysis.marketAnalysis.factors.specialtyDemand}
            </Descriptions.Item>
            <Descriptions.Item label="Experience Level">
              {analysis.compensationAnalysis.factors.experienceLevel}
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

        {/* Regulatory Compliance Section */}
        <div className="mb-8">
          <Title level={5}>Regulatory Compliance</Title>
          <Text type="secondary" className="mb-4">Ensuring adherence to federal regulations like the Stark Law and Anti-Kickback Statute</Text>
          
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

        {/* Commercial Reasonableness Section */}
        <div className="mb-8">
          <Title level={5}>Commercial Reasonableness</Title>
          <Text type="secondary" className="mb-4">Evaluating if the arrangement makes sense from a business perspective, independent of potential referrals</Text>
          
          <Space direction="vertical" className="w-full mb-4">
            <Text strong>Business Case Assessment:</Text>
            <ul className="list-disc pl-5">
              {analysis.documentationAnalysis.factors.businessCase.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            
            <Text strong className="mt-4">Strategic Alignment:</Text>
            <ul className="list-disc pl-5">
              {analysis.documentationAnalysis.factors.strategicAlignment.map((item, index) => (
                <li key={index}>{item}</li>
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

        {/* Benchmarking & Justification Section */}
        <div className="mb-8">
          <Title level={5}>Benchmarking & Justification</Title>
          <Text type="secondary" className="mb-4">Examining how compensation compares to industry benchmarks and justifying any deviations</Text>
          
          <Descriptions column={2} className="mb-4">
            <Descriptions.Item label="Compensation vs Benchmark">
              {analysis.compensationAnalysis.factors.benchmarkComparison}%
            </Descriptions.Item>
            <Descriptions.Item label="Market Position">
              {analysis.marketAnalysis.factors.marketPosition}
            </Descriptions.Item>
            <Descriptions.Item label="Specialty Factors">
              {analysis.marketAnalysis.factors.specialtyFactors.join(', ')}
            </Descriptions.Item>
            <Descriptions.Item label="Justification Status">
              <Tag color={analysis.compensationAnalysis.factors.justificationStatus === 'complete' ? 'success' : 'warning'}>
                {analysis.compensationAnalysis.factors.justificationStatus}
              </Tag>
            </Descriptions.Item>
          </Descriptions>

          <Space direction="vertical" className="w-full">
            <Text strong>Findings:</Text>
            <ul className="list-disc pl-5">
              {analysis.marketAnalysis.findings.map((finding, index) => (
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