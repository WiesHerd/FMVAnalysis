// src/components/MarketDataUpload.tsx
import React, { useRef, useState } from 'react';
import { Card } from './ui';

interface MarketData {
  specialty: string;
  year: number;
  p10_total: number;
  p25_total: number;
  p50_total: number;
  p75_total: number;
  p90_total: number;
  p10_wrvu: number;
  p25_wrvu: number;
  p50_wrvu: number;
  p75_wrvu: number;
  p90_wrvu: number;
  p10_cf: number;
  p25_cf: number;
  p50_cf: number;
  p75_cf: number;
  p90_cf: number;
}

interface MarketDataUploadProps {
  onDataUploaded: (data: MarketData[]) => void;
}

const REQUIRED_COLUMNS = [
  'specialty',
  'p10_total', 'p25_total', 'p50_total', 'p75_total', 'p90_total',
  'p10_wrvu', 'p25_wrvu', 'p50_wrvu', 'p75_wrvu', 'p90_wrvu',
  'p10_cf', 'p25_cf', 'p50_cf', 'p75_cf', 'p90_cf'
];

const MarketDataUpload = ({ onDataUploaded }: MarketDataUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validateHeaders = (headers: string[]): string | null => {
    const missingColumns = REQUIRED_COLUMNS.filter(col => 
      !headers.map(h => h.toLowerCase().trim()).includes(col.toLowerCase())
    );
    
    if (missingColumns.length > 0) {
      return `Missing required columns: ${missingColumns.join(', ')}`;
    }
    return null;
  };

  const validateDataTypes = (record: any): string | null => {
    if (typeof record.specialty !== 'string' || record.specialty.trim() === '') {
      return 'Specialty must be a non-empty string';
    }

    const numericFields = REQUIRED_COLUMNS.filter(col => col !== 'specialty');
    for (const field of numericFields) {
      const value = record[field];
      if (typeof value !== 'number' || isNaN(value)) {
        return `${field} must be a valid number`;
      }
      if (value < 0) {
        return `${field} cannot be negative`;
      }
    }

    return null;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);
    setSuccess(null);
    
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

        // Validate headers
        const headerError = validateHeaders(headers);
        if (headerError) {
          setError(headerError);
          return;
        }

        const data: MarketData[] = [];
        
        // Process each line
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const values = line.split(',');
          if (values.length !== headers.length) {
            setError(`Line ${i + 1} has incorrect number of columns`);
            return;
          }

          const record: any = {};
          headers.forEach((header, index) => {
            const value = values[index].trim();
            record[header] = header === 'specialty' ? value : parseFloat(value);
          });

          // Validate data types and values
          const dataError = validateDataTypes(record);
          if (dataError) {
            setError(`Error in line ${i + 1}: ${dataError}`);
            return;
          }

          data.push(record as MarketData);
        }

        if (data.length === 0) {
          setError('No valid data found in file');
          return;
        }

        setSuccess(`Successfully validated ${data.length} market data entries`);
        onDataUploaded(data);
        
      } catch (err) {
        setError(`Error processing file: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    reader.onerror = () => {
      setError('Error reading file');
    };

    reader.readAsText(file);
  };

  return (
    <Card title="Market Data Upload">
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Upload Market Benchmark Data</h4>
          <p className="text-xs text-gray-500 mb-4">
            Upload a CSV file containing market benchmarks with the following required columns:
            <br />
            - specialty
            <br />
            - Percentiles (10th, 25th, 50th, 75th, 90th) for:
            <br />
            &nbsp;&nbsp;• Total Compensation (p10_total, p25_total, etc.)
            <br />
            &nbsp;&nbsp;• Work RVUs (p10_wrvu, p25_wrvu, etc.)
            <br />
            &nbsp;&nbsp;• Conversion Factors (p10_cf, p25_cf, etc.)
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
            {success}
          </div>
        )}

        <div className="flex items-center justify-between">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Choose File
          </button>
          <span className="text-sm text-gray-500">
            {fileInputRef.current?.files?.[0]?.name || 'No file chosen'}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default MarketDataUpload;            