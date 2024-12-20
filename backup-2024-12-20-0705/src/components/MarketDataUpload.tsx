// src/components/MarketDataUpload.tsx
import React, { useRef, useState } from 'react';
import { Card, Table, Button, Input } from 'antd';
import { UploadOutlined, PrinterOutlined } from '@ant-design/icons';

const { Search } = Input;

interface MarketDataUploadProps {
  onDataUploaded: (data: any[]) => void;
}

const MarketDataUpload: React.FC<MarketDataUploadProps> = ({ onDataUploaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  const columns = [
    {
      title: 'Specialty',
      dataIndex: 'specialty',
      key: 'specialty',
      width: 150,
    },
    {
      title: 'Total Cash Compensation',
      children: [
        {
          title: '25th',
          dataIndex: 'p25_total',
          key: 'p25_total',
          width: 120,
          render: (value: number) => `$${value.toLocaleString()}`,
        },
        {
          title: '50th',
          dataIndex: 'p50_total',
          key: 'p50_total',
          width: 120,
          render: (value: number) => `$${value.toLocaleString()}`,
        },
        {
          title: '75th',
          dataIndex: 'p75_total',
          key: 'p75_total',
          width: 120,
          render: (value: number) => `$${value.toLocaleString()}`,
        },
        {
          title: '90th',
          dataIndex: 'p90_total',
          key: 'p90_total',
          width: 120,
          render: (value: number) => `$${value.toLocaleString()}`,
        },
      ],
    },
    {
      title: 'Work RVUs',
      children: [
        {
          title: '25th',
          dataIndex: 'p25_wrvu',
          key: 'p25_wrvu',
          width: 100,
          render: (value: number) => value.toLocaleString(),
        },
        {
          title: '50th',
          dataIndex: 'p50_wrvu',
          key: 'p50_wrvu',
          width: 100,
          render: (value: number) => value.toLocaleString(),
        },
        {
          title: '75th',
          dataIndex: 'p75_wrvu',
          key: 'p75_wrvu',
          width: 100,
          render: (value: number) => value.toLocaleString(),
        },
        {
          title: '90th',
          dataIndex: 'p90_wrvu',
          key: 'p90_wrvu',
          width: 100,
          render: (value: number) => value.toLocaleString(),
        },
      ],
    },
    {
      title: 'Conversion Factor',
      children: [
        {
          title: '25th',
          dataIndex: 'p25_cf',
          key: 'p25_cf',
          width: 100,
          render: (value: number) => `$${value.toFixed(2)}`,
        },
        {
          title: '50th',
          dataIndex: 'p50_cf',
          key: 'p50_cf',
          width: 100,
          render: (value: number) => `$${value.toFixed(2)}`,
        },
        {
          title: '75th',
          dataIndex: 'p75_cf',
          key: 'p75_cf',
          width: 100,
          render: (value: number) => `$${value.toFixed(2)}`,
        },
        {
          title: '90th',
          dataIndex: 'p90_cf',
          key: 'p90_cf',
          width: 100,
          render: (value: number) => `$${value.toFixed(2)}`,
        },
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-medium text-gray-900">Market Data Management</h1>
        <div className="flex gap-4">
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-500"
          >
            Upload Market Data
          </Button>
          <Button
            icon={<PrinterOutlined />}
            className="border-gray-300"
          >
            Print Market Data
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="text-base font-medium">Data Preview</div>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Loaded market data for all specialties
            </div>
          </div>
          <Search
            placeholder="Search specialties..."
            style={{ width: 250 }}
          />
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".csv"
          className="hidden"
        />

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
            {success}
          </div>
        )}

        <Table
          columns={columns}
          dataSource={[]}
          size="middle"
          scroll={{ x: 'max-content' }}
          pagination={{ pageSize: 10 }}
          bordered
        />
      </Card>
    </div>
  );
};

export default MarketDataUpload;            