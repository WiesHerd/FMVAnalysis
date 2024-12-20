import React, { useState, useEffect, useRef } from 'react';
import { Table, Input, Button } from 'antd';
import { SearchOutlined, UploadOutlined, PrinterOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import Papa from 'papaparse';
import '../styles/MarketData.css';

interface MarketDataRow {
  specialty: string;
  total_25th: number;
  total_50th: number;
  total_75th: number;
  total_90th: number;
  wrvus_25th: number;
  wrvus_50th: number;
  wrvus_75th: number;
  wrvus_90th: number;
  cf_25th: number;
  cf_50th: number;
  cf_75th: number;
  cf_90th: number;
}

const MarketData: React.FC = () => {
  const [data, setData] = useState<MarketDataRow[]>([]);
  const [searchText, setSearchText] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'success' | 'error' | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedData = localStorage.getItem('marketData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setData(parsedData);
        console.log('Loaded stored data:', parsedData);
      } catch (error) {
        console.error('Error loading stored data:', error);
      }
    }
  }, []);

  const handleFileUpload = (file: File) => {
    setUploadStatus(null);
    setStatusMessage('');

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadStatus('error');
      setStatusMessage('Please upload a CSV file');
      return false;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log('CSV Parse Results:', results);
        if (results.data[0]) {
          console.log('CSV Column Headers:', Object.keys(results.data[0] as object));
        }
        
        if (results.errors.length > 0) {
          console.error('CSV parsing errors:', results.errors);
          setUploadStatus('error');
          setStatusMessage('Error parsing CSV file');
          return;
        }

        try {
          const parsedData = results.data.map((row: any) => {
            console.log('Raw row data:', row);
            // Remove any $ signs and commas from values before parsing
            const cleanValue = (value: string | undefined) => {
              if (!value) return 0;
              const cleanStr = value.toString().replace(/[$,]/g, '');
              return parseFloat(cleanStr) || 0;
            };

            return {
              specialty: row.specialty || '',
              // Total Cash Compensation
              total_25th: cleanValue(row.p25_total),
              total_50th: cleanValue(row.p50_total),
              total_75th: cleanValue(row.p75_total),
              total_90th: cleanValue(row.p90_total),
              // wRVUs
              wrvus_25th: cleanValue(row.p25_wrvu),
              wrvus_50th: cleanValue(row.p50_wrvu),
              wrvus_75th: cleanValue(row.p75_wrvu),
              wrvus_90th: cleanValue(row.p90_wrvu),
              // Conversion Factors
              cf_25th: cleanValue(row.p25_cf),
              cf_50th: cleanValue(row.p50_cf),
              cf_75th: cleanValue(row.p75_cf),
              cf_90th: cleanValue(row.p90_cf),
            };
          });

          console.log('Parsed data:', parsedData);

          const validData = parsedData.filter(record => {
            const isValid = record.specialty && 
              (!isNaN(record.total_50th) || !isNaN(record.total_25th) || !isNaN(record.total_75th) || !isNaN(record.total_90th));
            
            if (!isValid) {
              console.log('Invalid record:', record);
            }
            return isValid;
          });

          console.log('Valid data:', validData);

          if (validData.length === 0) {
            setUploadStatus('error');
            setStatusMessage('No valid records found in CSV');
            return;
          }

          setData(validData);
          localStorage.setItem('marketData', JSON.stringify(validData));
          setUploadStatus('success');
          setStatusMessage(`Loaded ${validData.length} records from CSV`);
        } catch (error) {
          console.error('Data processing error:', error);
          setUploadStatus('error');
          setStatusMessage('Error processing CSV data');
        }
      },
      error: (error) => {
        console.error('CSV reading error:', error);
        setUploadStatus('error');
        setStatusMessage('Error reading CSV file');
      }
    });
    return false;
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const columns: ColumnsType<MarketDataRow> = [
    {
      title: 'Specialty',
      dataIndex: 'specialty',
      key: 'specialty',
      width: 250,
      fixed: 'left',
      className: 'specialty-column',
    },
    {
      title: 'Total Cash Compensation',
      children: [
        {
          title: '25th',
          dataIndex: 'total_25th',
          key: 'total_25th',
          width: 130,
          align: 'right',
          render: (value: number) => value ? `$${value.toLocaleString()}` : '-',
        },
        {
          title: '50th',
          dataIndex: 'total_50th',
          key: 'total_50th',
          width: 130,
          align: 'right',
          render: (value: number) => value ? `$${value.toLocaleString()}` : '-',
        },
        {
          title: '75th',
          dataIndex: 'total_75th',
          key: 'total_75th',
          width: 130,
          align: 'right',
          render: (value: number) => value ? `$${value.toLocaleString()}` : '-',
        },
        {
          title: '90th',
          dataIndex: 'total_90th',
          key: 'total_90th',
          width: 130,
          align: 'right',
          render: (value: number) => value ? `$${value.toLocaleString()}` : '-',
          className: 'section-end',
        },
      ],
    },
    {
      title: 'wRVUs',
      children: [
        {
          title: '25th',
          dataIndex: 'wrvus_25th',
          key: 'wrvus_25th',
          width: 100,
          align: 'right',
          render: (value: number) => value ? value.toLocaleString() : '-',
        },
        {
          title: '50th',
          dataIndex: 'wrvus_50th',
          key: 'wrvus_50th',
          width: 100,
          align: 'right',
          render: (value: number) => value ? value.toLocaleString() : '-',
        },
        {
          title: '75th',
          dataIndex: 'wrvus_75th',
          key: 'wrvus_75th',
          width: 100,
          align: 'right',
          render: (value: number) => value ? value.toLocaleString() : '-',
        },
        {
          title: '90th',
          dataIndex: 'wrvus_90th',
          key: 'wrvus_90th',
          width: 100,
          align: 'right',
          render: (value: number) => value ? value.toLocaleString() : '-',
          className: 'section-end',
        },
      ],
    },
    {
      title: 'Conversion Factor',
      children: [
        {
          title: '25th',
          dataIndex: 'cf_25th',
          key: 'cf_25th',
          width: 100,
          align: 'right',
          render: (value: number) => value ? `$${value.toFixed(2)}` : '-',
        },
        {
          title: '50th',
          dataIndex: 'cf_50th',
          key: 'cf_50th',
          width: 100,
          align: 'right',
          render: (value: number) => value ? `$${value.toFixed(2)}` : '-',
        },
        {
          title: '75th',
          dataIndex: 'cf_75th',
          key: 'cf_75th',
          width: 100,
          align: 'right',
          render: (value: number) => value ? `$${value.toFixed(2)}` : '-',
        },
        {
          title: '90th',
          dataIndex: 'cf_90th',
          key: 'cf_90th',
          width: 100,
          align: 'right',
          render: (value: number) => value ? `$${value.toFixed(2)}` : '-',
        },
      ],
    },
  ];

  const filteredData = data.filter(item =>
    item.specialty.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="h-full">
      <div className="print:hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">Market Data Management</h2>
          <div className="flex gap-4">
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center bg-blue-600 hover:bg-blue-700"
            >
              Upload Market Data
            </Button>
            <Button
              icon={<PrinterOutlined />}
              onClick={() => window.print()}
              className="flex items-center border-gray-300"
            >
              Print Market Data
            </Button>
            <Button
              onClick={() => {
                setData([]);
                localStorage.removeItem('marketData');
                setUploadStatus(null);
                setStatusMessage('');
              }}
              className="flex items-center border-gray-300"
            >
              Clear Data
            </Button>
          </div>
        </div>

        {uploadStatus && (
          <div className="mb-4">
            <div className={`px-4 py-2 rounded-md text-sm inline-flex items-center gap-2 ${
              uploadStatus === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                uploadStatus === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              {statusMessage}
            </div>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept=".csv"
          className="hidden"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200 print:hidden">
          <div className="flex justify-between items-center">
            <div className="text-lg font-medium text-gray-900">Data Preview</div>
            {data.length > 0 && (
              <Input
                placeholder="Search specialties..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="w-72"
              />
            )}
          </div>
        </div>

        <div className="px-4 py-3">
          {data.length > 0 ? (
            <Table<MarketDataRow>
              columns={columns}
              dataSource={filteredData}
              rowKey="specialty"
              pagination={false}
              scroll={{ x: 'max-content', y: 'calc(100vh - 300px)' }}
              bordered
              size="middle"
              className="market-data-table"
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              No market data loaded. Please upload a CSV file.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketData; 