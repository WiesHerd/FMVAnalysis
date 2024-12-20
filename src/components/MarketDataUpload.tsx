// src/components/MarketDataUpload.tsx
import React, { useRef, useState } from 'react';
import { Card, Table, Button, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TableProps } from 'antd/es/table';
import { UploadOutlined, PrinterOutlined, SearchOutlined } from '@ant-design/icons';
import { formatCurrency, formatNumber } from '../utils/formatters';
import '../styles/ProviderTable.css';

interface MarketData {
  specialty: string;
  tcc_25th: number;
  tcc_50th: number;
  tcc_75th: number;
  tcc_90th: number;
  wrvu_25th: number;
  wrvu_50th: number;
  wrvu_75th: number;
  wrvu_90th: number;
  tcc_per_wrvu_25th: number;
  tcc_per_wrvu_50th: number;
  tcc_per_wrvu_75th: number;
  tcc_per_wrvu_90th: number;
}

interface MarketDataUploadProps {
  onDataUploaded: (data: MarketData[]) => void;
}

const MarketDataUpload: React.FC<MarketDataUploadProps> = ({ onDataUploaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [data, setData] = useState<MarketData[]>([]);
  const [searchText, setSearchText] = useState('');

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

          const record: Record<string, string | number> = {};
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

          data.push({
            specialty: record.specialty as string,
            tcc_25th: record.tcc_25th as number,
            tcc_50th: record.tcc_50th as number,
            tcc_75th: record.tcc_75th as number,
            tcc_90th: record.tcc_90th as number,
            wrvu_25th: record.wrvu_25th as number,
            wrvu_50th: record.wrvu_50th as number,
            wrvu_75th: record.wrvu_75th as number,
            wrvu_90th: record.wrvu_90th as number,
            tcc_per_wrvu_25th: record.tcc_per_wrvu_25th as number,
            tcc_per_wrvu_50th: record.tcc_per_wrvu_50th as number,
            tcc_per_wrvu_75th: record.tcc_per_wrvu_75th as number,
            tcc_per_wrvu_90th: record.tcc_per_wrvu_90th as number
          });
        }

        if (data.length === 0) {
          setError('No valid data found in file');
          return;
        }

        setSuccess(`Successfully validated ${data.length} market data entries`);
        setData(data);
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

  const validateHeaders = (headers: string[]): string | null => {
    const requiredHeaders = [
      'specialty',
      'tcc_25th', 'tcc_50th', 'tcc_75th', 'tcc_90th',
      'wrvu_25th', 'wrvu_50th', 'wrvu_75th', 'wrvu_90th',
      'tcc_per_wrvu_25th', 'tcc_per_wrvu_50th', 'tcc_per_wrvu_75th', 'tcc_per_wrvu_90th'
    ];

    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      return `Missing required columns: ${missingHeaders.join(', ')}`;
    }

    return null;
  };

  const validateDataTypes = (record: Record<string, string | number>): string | null => {
    if (!record.specialty || typeof record.specialty !== 'string') {
      return 'Invalid specialty value';
    }

    const numericFields = [
      'tcc_25th', 'tcc_50th', 'tcc_75th', 'tcc_90th',
      'wrvu_25th', 'wrvu_50th', 'wrvu_75th', 'wrvu_90th',
      'tcc_per_wrvu_25th', 'tcc_per_wrvu_50th', 'tcc_per_wrvu_75th', 'tcc_per_wrvu_90th'
    ];

    for (const field of numericFields) {
      const value = record[field];
      if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) {
        return `Invalid ${field} value: must be a positive number`;
      }
    }

    return null;
  };

  const columns: ColumnsType<MarketData> = [
    {
      title: 'Specialty',
      dataIndex: 'specialty',
      key: 'specialty',
      width: 200,
      sorter: (a, b) => a.specialty.localeCompare(b.specialty),
      sortDirections: ['ascend', 'descend'],
      showSorterTooltip: false,
      filterSearch: true,
      filters: data
        .map(item => item.specialty)
        .filter((value, index, self) => self.indexOf(value) === index)
        .map(specialty => ({ text: specialty, value: specialty })),
      onFilter: (value, record) => record.specialty === value
    },
    {
      title: 'Total Cash Compensation',
      children: [
        {
          title: '25th',
          dataIndex: 'tcc_25th',
          key: 'tcc_25th',
          width: 120,
          render: (value: number) => formatCurrency(value),
          sorter: (a, b) => a.tcc_25th - b.tcc_25th,
          sortDirections: ['descend', 'ascend'],
          showSorterTooltip: false
        },
        {
          title: '50th',
          dataIndex: 'tcc_50th',
          key: 'tcc_50th',
          width: 120,
          render: (value: number) => formatCurrency(value),
          sorter: (a, b) => a.tcc_50th - b.tcc_50th,
          sortDirections: ['descend', 'ascend'],
          showSorterTooltip: false
        },
        {
          title: '75th',
          dataIndex: 'tcc_75th',
          key: 'tcc_75th',
          width: 120,
          render: (value: number) => formatCurrency(value),
          sorter: (a, b) => a.tcc_75th - b.tcc_75th,
          sortDirections: ['descend', 'ascend'],
          showSorterTooltip: false
        },
        {
          title: '90th',
          dataIndex: 'tcc_90th',
          key: 'tcc_90th',
          width: 120,
          render: (value: number) => formatCurrency(value),
          sorter: (a, b) => a.tcc_90th - b.tcc_90th,
          sortDirections: ['descend', 'ascend'],
          showSorterTooltip: false
        }
      ]
    },
    {
      title: 'Work RVUs',
      children: [
        {
          title: '25th',
          dataIndex: 'wrvu_25th',
          key: 'wrvu_25th',
          width: 100,
          render: (value: number) => formatNumber(value),
          sorter: (a, b) => a.wrvu_25th - b.wrvu_25th,
          sortDirections: ['descend', 'ascend'],
          showSorterTooltip: false
        },
        {
          title: '50th',
          dataIndex: 'wrvu_50th',
          key: 'wrvu_50th',
          width: 100,
          render: (value: number) => formatNumber(value),
          sorter: (a, b) => a.wrvu_50th - b.wrvu_50th,
          sortDirections: ['descend', 'ascend'],
          showSorterTooltip: false
        },
        {
          title: '75th',
          dataIndex: 'wrvu_75th',
          key: 'wrvu_75th',
          width: 100,
          render: (value: number) => formatNumber(value),
          sorter: (a, b) => a.wrvu_75th - b.wrvu_75th,
          sortDirections: ['descend', 'ascend'],
          showSorterTooltip: false
        },
        {
          title: '90th',
          dataIndex: 'wrvu_90th',
          key: 'wrvu_90th',
          width: 100,
          render: (value: number) => formatNumber(value),
          sorter: (a, b) => a.wrvu_90th - b.wrvu_90th,
          sortDirections: ['descend', 'ascend'],
          showSorterTooltip: false
        }
      ]
    },
    {
      title: 'TCC/wRVU',
      children: [
        {
          title: '25th',
          dataIndex: 'tcc_per_wrvu_25th',
          key: 'tcc_per_wrvu_25th',
          width: 100,
          render: (value: number) => formatCurrency(value),
          sorter: (a, b) => a.tcc_per_wrvu_25th - b.tcc_per_wrvu_25th,
          sortDirections: ['descend', 'ascend'],
          showSorterTooltip: false
        },
        {
          title: '50th',
          dataIndex: 'tcc_per_wrvu_50th',
          key: 'tcc_per_wrvu_50th',
          width: 100,
          render: (value: number) => formatCurrency(value),
          sorter: (a, b) => a.tcc_per_wrvu_50th - b.tcc_per_wrvu_50th,
          sortDirections: ['descend', 'ascend'],
          showSorterTooltip: false
        },
        {
          title: '75th',
          dataIndex: 'tcc_per_wrvu_75th',
          key: 'tcc_per_wrvu_75th',
          width: 100,
          render: (value: number) => formatCurrency(value),
          sorter: (a, b) => a.tcc_per_wrvu_75th - b.tcc_per_wrvu_75th,
          sortDirections: ['descend', 'ascend'],
          showSorterTooltip: false
        },
        {
          title: '90th',
          dataIndex: 'tcc_per_wrvu_90th',
          key: 'tcc_per_wrvu_90th',
          width: 100,
          render: (value: number) => formatCurrency(value),
          sorter: (a, b) => a.tcc_per_wrvu_90th - b.tcc_per_wrvu_90th,
          sortDirections: ['descend', 'ascend'],
          showSorterTooltip: false
        }
      ]
    }
  ];

  const handleTableChange: TableProps<MarketData>['onChange'] = (pagination, filters, sorter) => {
    console.log('Table change:', { pagination, filters, sorter });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Market Data Management</h1>
        <div className="flex gap-4">
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-500"
          >
            Upload Market Data
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Market Data</h2>
              <p className="text-sm text-gray-500">View and manage market benchmarks by specialty</p>
            </div>
            <Input
              placeholder="Search specialties..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 250 }}
              className="rounded-md"
            />
          </div>

          <Table
            columns={columns}
            dataSource={data.filter(item => 
              item.specialty.toLowerCase().includes(searchText.toLowerCase())
            )}
            rowKey="specialty"
            pagination={{ pageSize: 10 }}
            onChange={handleTableChange}
            bordered
            className="provider-table"
          />
        </div>
      </div>
    </div>
  );
};

export default MarketDataUpload;            