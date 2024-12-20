import React from 'react';
import { Form, Input } from 'antd';

// Utility functions for formatting
const formatCurrency = (value: string | number): string => {
  if (!value) return '';
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
};

const formatDecimal = (value: string | number): string => {
  if (!value) return '';
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : value;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

const formatNumber = (value: string | number): string => {
  if (!value) return '';
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : value;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
};

interface CompensationComponentProps {
  title: string;
  showWRVUs?: boolean;
  onDelete?: () => void;
}

const CompensationComponent: React.FC<CompensationComponentProps> = ({
  title,
  showWRVUs = false,
  onDelete
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          {title === 'Clinical Base Pay' && (
            <span className="ml-2 text-gray-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          )}
        </div>
        {onDelete && (
          <button
            onClick={onDelete}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="text-sm text-gray-500 mb-1 text-right">Amount</div>
          <Form.Item
            name={`${title.toLowerCase().replace(/\s+/g, '_')}_amount`}
            rules={[{ required: true, message: 'Please enter amount' }]}
            className="mb-0"
          >
            <Input
              placeholder="Enter amount"
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9.]/g, '');
                e.target.value = value ? formatCurrency(value) : '';
              }}
              className="text-right"
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
              }}
            />
          </Form.Item>
        </div>

        <div>
          <div className="text-sm text-gray-500 mb-1 text-right">FTE</div>
          <Form.Item
            name={`${title.toLowerCase().replace(/\s+/g, '_')}_fte`}
            rules={[{ required: true, message: 'Please enter FTE' }]}
            className="mb-0"
          >
            <Input
              placeholder="Enter FTE"
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9.]/g, '');
                e.target.value = value ? formatDecimal(value) : '';
              }}
              className="text-right"
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
              }}
            />
          </Form.Item>
        </div>

        {showWRVUs && (
          <>
            <div>
              <div className="text-sm text-gray-500 mb-1 text-right">Annual wRVUs</div>
              <Form.Item
                name={`${title.toLowerCase().replace(/\s+/g, '_')}_wrvus`}
                rules={[{ required: true, message: 'Please enter wRVUs' }]}
                className="mb-0"
              >
                <Input
                  placeholder="Enter wRVUs"
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, '');
                    e.target.value = value ? formatNumber(value) : '';
                  }}
                  className="text-right"
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                  }}
                />
              </Form.Item>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-1 text-right">Conversion Factor</div>
              <Form.Item
                name={`${title.toLowerCase().replace(/\s+/g, '_')}_cf`}
                rules={[{ required: true, message: 'Please enter conversion factor' }]}
                className="mb-0"
              >
                <Input
                  placeholder="Enter conversion factor"
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, '');
                    e.target.value = value ? formatCurrency(value) : '';
                  }}
                  className="text-right"
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                  }}
                />
              </Form.Item>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CompensationComponent; 