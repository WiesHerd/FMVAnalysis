import React, { useState, useEffect } from 'react';
import { Upload, Card, Table, Input, Button, Alert } from 'antd';
import { UploadOutlined, PrinterOutlined } from '@ant-design/icons';
import Papa, { ParseResult } from 'papaparse';
import '../styles/EmployeeData.css';
import ErrorBoundary from '../components/ErrorBoundary';

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

const EmployeeDataTable: React.FC<{ data: EmployeeData[], searchText: string }> = ({ data, searchText }) => {
  const columns = [
    {
      title: 'Employee Information',
      children: [
        {
          title: 'Employee ID',
          dataIndex: 'employee_id',
          key: 'employee_id',
          width: 120,
          className: 'specialty-column',
          fixed: 'left'
        },
        {
          title: 'Name',
          dataIndex: 'full_name',
          key: 'full_name',
          width: 180
        },
        {
          title: 'Specialty',
          dataIndex: 'specialty',
          key: 'specialty',
          width: 180,
          onCell: () => ({ 'data-key': 'section-end' }),
          onHeaderCell: () => ({ 'data-key': 'section-end' })
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
          render: (value: number) => formatCurrency(value)
        },
        {
          title: 'wRVU Incentive',
          dataIndex: 'wrvu_incentive',
          key: 'wrvu_incentive',
          width: 120,
          render: (value: number) => formatCurrency(value)
        },
        {
          title: 'Quality',
          dataIndex: 'quality_payments',
          key: 'quality_payments',
          width: 120,
          render: (value: number) => formatCurrency(value)
        },
        {
          title: 'Admin',
          dataIndex: 'admin_payments',
          key: 'admin_payments',
          width: 120,
          render: (value: number) => formatCurrency(value),
          onCell: () => ({ 'data-key': 'section-end' }),
          onHeaderCell: () => ({ 'data-key': 'section-end' })
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
          render: (value: number) => formatNumber(value)
        },
        {
          title: 'Conversion Factor',
          dataIndex: 'conversion_factor',
          key: 'conversion_factor',
          width: 120,
          render: (value: number) => value ? `$${value.toFixed(2)}` : '$0.00'
        }
      ]
    }
  ];

  const filteredData = data.filter(record =>
    (record.full_name?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
    (record.specialty?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
    (record.employee_id?.toLowerCase() || '').includes(searchText.toLowerCase())
  );

  return (
    <Table
      dataSource={filteredData}
      columns={columns}
      rowKey="employee_id"
      scroll={{ x: 'max-content' }}
      pagination={false}
      bordered
      size="small"
      className="employee-data-table"
    />
  );
};

const EmployeeDataPage: React.FC = () => {
  const [employeeData, setEmployeeData] = useState<EmployeeData[]>([]);
  const [searchText, setSearchText] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'success' | 'error' | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const savedData = localStorage.getItem('employeeData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setEmployeeData(parsedData);
        setUploadStatus('success');
        setStatusMessage(`Loaded ${parsedData.length} records from storage`);
      } catch (err) {
        console.error('Error loading employee data from storage:', err);
        setUploadStatus('error');
        setStatusMessage('Error loading saved employee data');
      }
    }
  }, []);

  const handleFileUpload = (file: File) => {
    setUploadStatus(null);
    setStatusMessage('');

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
          setStatusMessage(`Successfully uploaded ${parsedData.length} records`);
        } catch (err) {
          console.error('Error processing CSV data:', err);
          setUploadStatus('error');
          setStatusMessage(`Error processing CSV file: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      },
      error: (error: Error) => {
        console.error('PapaParse error:', error);
        setUploadStatus('error');
        setStatusMessage('Error parsing CSV file: ' + error.message);
      }
    });
    return false;
  };

  const handleClearData = () => {
    setEmployeeData([]);
    localStorage.removeItem('employeeData');
    setUploadStatus(null);
    setStatusMessage('');
  };

  return (
    <ErrorBoundary>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Employee Data Management</h1>
          <div className="flex gap-2">
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
            >
              Upload Employee Data
            </Button>
            <Button
              type="default"
              icon={<PrinterOutlined />}
              onClick={() => window.print()}
            >
              Print Employee Data
            </Button>
            <Button
              type="default"
              onClick={handleClearData}
            >
              Clear Data
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <Upload.Dragger
            accept=".csv"
            beforeUpload={handleFileUpload}
            showUploadList={false}
            className="hidden"
          >
            <input type="file" accept=".csv" className="hidden" />
          </Upload.Dragger>

          {uploadStatus && (
            <Alert
              message={statusMessage}
              type={uploadStatus}
              showIcon
              className="mb-4"
            />
          )}
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-medium mb-2">Data Preview</h2>
          <div className="flex justify-end mb-2">
            <Input.Search
              placeholder="Search employees..."
              allowClear
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 200 }}
            />
          </div>
          <EmployeeDataTable data={employeeData} searchText={searchText} />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default EmployeeDataPage; 