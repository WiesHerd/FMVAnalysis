import React, { useState, useEffect, useRef } from 'react';
import { Table, Input, Button } from 'antd';
import { SearchOutlined, UploadOutlined, PrinterOutlined } from '@ant-design/icons';
import Papa, { ParseResult } from 'papaparse';
import '../styles/EmployeeData.css';

interface EmployeeData {
  employee_id: string;
  full_name: string;
  specialty: string;
  base_pay: number;
  wrvu_incentive: number;
  quality_payments: number;
  admin_payments: number;
  annual_wrvus: number;
  conversion_factor: number;
}

const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '-';
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '-';
  return value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const EmployeeData: React.FC = () => {
  const [employeeData, setEmployeeData] = useState<EmployeeData[]>([]);
  const [searchText, setSearchText] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'success' | 'error' | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedData = localStorage.getItem('employeeData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setEmployeeData(parsedData);
      } catch (err) {
        console.error('Error loading employee data from storage:', err);
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
      transformHeader: (header: string) => header.trim(),
      complete: (results: ParseResult<any>) => {
        try {
          if (!results.data || results.data.length === 0) {
            setUploadStatus('error');
            setStatusMessage('No data found in the CSV file');
            return;
          }

          const requiredColumns = [
            'employee_id',
            'full_name',
            'specialty',
            'base_pay',
            'wrvu_incentive',
            'quality_payments',
            'admin_payments',
            'annual_wrvus'
          ];

          const missingColumns = requiredColumns.filter(col => !results.meta.fields?.includes(col));
          if (missingColumns.length > 0) {
            setUploadStatus('error');
            setStatusMessage(`Missing required columns: ${missingColumns.join(', ')}`);
            return;
          }

          const parsedData = results.data.map((row: any) => ({
            employee_id: row.employee_id?.toString().trim() || '',
            full_name: row.full_name?.toString().trim() || '',
            specialty: row.specialty?.toString().trim() || '',
            base_pay: parseFloat(row.base_pay) || 0,
            wrvu_incentive: parseFloat(row.wrvu_incentive) || 0,
            quality_payments: parseFloat(row.quality_payments) || 0,
            admin_payments: parseFloat(row.admin_payments) || 0,
            annual_wrvus: parseFloat(row.annual_wrvus) || 0,
            conversion_factor: parseFloat(row.conversion_factor) || 0
          }));

          setEmployeeData(parsedData);
          localStorage.setItem('employeeData', JSON.stringify(parsedData));
          setUploadStatus('success');
          setStatusMessage(`Loaded ${parsedData.length} employee records`);
        } catch (err) {
          console.error('Error processing CSV data:', err);
          setUploadStatus('error');
          setStatusMessage('Error processing CSV data');
        }
      },
      error: (error: Error) => {
        console.error('PapaParse error:', error);
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

  const columns = [
    {
      title: 'Employee Information',
      children: [
        {
          title: 'Employee ID',
          dataIndex: 'employee_id',
          key: 'employee_id',
          width: 150,
          className: 'specialty-column',
          fixed: 'left'
        },
        {
          title: 'Name',
          dataIndex: 'full_name',
          key: 'full_name',
          width: 200
        },
        {
          title: 'Specialty',
          dataIndex: 'specialty',
          key: 'specialty',
          width: 200,
          className: 'section-end'
        }
      ]
    },
    {
      title: 'Compensation',
      children: [
        {
          title: 'Base Pay',
          dataIndex: 'base_pay',
          key: 'base_pay',
          width: 120,
          align: 'right',
          render: (value: number) => formatCurrency(value)
        },
        {
          title: 'wRVU Incentive',
          dataIndex: 'wrvu_incentive',
          key: 'wrvu_incentive',
          width: 120,
          align: 'right',
          render: (value: number) => formatCurrency(value)
        },
        {
          title: 'Quality',
          dataIndex: 'quality_payments',
          key: 'quality_payments',
          width: 120,
          align: 'right',
          render: (value: number) => formatCurrency(value)
        },
        {
          title: 'Admin',
          dataIndex: 'admin_payments',
          key: 'admin_payments',
          width: 120,
          align: 'right',
          render: (value: number) => formatCurrency(value),
          className: 'section-end'
        }
      ]
    },
    {
      title: 'Productivity',
      children: [
        {
          title: 'Annual wRVUs',
          dataIndex: 'annual_wrvus',
          key: 'annual_wrvus',
          width: 120,
          align: 'right',
          render: (value: number) => formatNumber(value)
        },
        {
          title: 'Conversion Factor',
          dataIndex: 'conversion_factor',
          key: 'conversion_factor',
          width: 120,
          align: 'right',
          render: (value: number) => value ? `$${value.toFixed(2)}` : '$0.00'
        }
      ]
    }
  ];

  const filteredData = employeeData.filter(record =>
    (record.full_name?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
    (record.specialty?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
    (record.employee_id?.toLowerCase() || '').includes(searchText.toLowerCase())
  );

  return (
    <div className="h-full">
      <div className="print:hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">Employee Data Management</h2>
          <div className="flex gap-4">
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center bg-blue-600 hover:bg-blue-700"
            >
              Upload Employee Data
            </Button>
            <Button
              icon={<PrinterOutlined />}
              onClick={() => window.print()}
              className="flex items-center border-gray-300"
            >
              Print Employee Data
            </Button>
            <Button
              onClick={() => {
                setEmployeeData([]);
                localStorage.removeItem('employeeData');
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
            {employeeData.length > 0 && (
              <Input
                placeholder="Search employees..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="w-72"
              />
            )}
          </div>
        </div>

        <div className="px-4 py-3">
          {employeeData.length > 0 ? (
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="employee_id"
              pagination={false}
              scroll={{ x: 'max-content', y: 'calc(100vh - 300px)' }}
              bordered
              size="middle"
              className="employee-data-table"
            />
          ) : (
            <div className="text-center py-12">
              <div className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="text-gray-500">No employee data loaded. Please upload a CSV file.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeData; 