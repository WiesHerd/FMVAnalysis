import React, { useRef, useState, useEffect } from 'react';
import { Table, Button, Input, message } from 'antd';
import { UploadOutlined, DownloadOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import Papa, { ParseResult } from 'papaparse';
import { formatCurrency, formatNumber } from '../utils/formatters';
import FMVIcon from '../components/FMVIcon';
import * as XLSX from 'xlsx';

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

const EmployeeData: React.FC = () => {
  const [employeeData, setEmployeeData] = useState<EmployeeData[]>([]);
  const [filteredData, setFilteredData] = useState<EmployeeData[]>([]);
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

  const handleDownloadExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // Format the data for Excel
    const excelData = filteredData.map(provider => ({
      'Provider ID': provider.employee_id,
      'Name': provider.full_name,
      'Specialty': provider.specialty,
      'Base Pay': formatCurrency(provider.base_pay),
      'wRVU Incentive': formatCurrency(provider.wrvu_incentive),
      'Quality': formatCurrency(provider.quality_payments),
      'Admin': formatCurrency(provider.admin_payments),
      'Annual wRVUs': formatNumber(provider.annual_wrvus),
      'Conversion Factor': formatCurrency(provider.conversion_factor)
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 12 }, // Provider ID
      { wch: 20 }, // Name
      { wch: 15 }, // Specialty
      { wch: 12 }, // Base Pay
      { wch: 15 }, // wRVU Incentive
      { wch: 12 }, // Quality
      { wch: 12 }, // Admin
      { wch: 15 }, // Annual wRVUs
      { wch: 15 }  // Conversion Factor
    ];
    worksheet['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Provider Data');
    XLSX.writeFile(workbook, 'provider_data.xlsx');
  };

  const handleClearData = () => {
    setEmployeeData([]);
    setFilteredData([]);
    localStorage.removeItem('employeeData');
    message.success('Data cleared successfully');
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    const filtered = employeeData.filter(record => 
      record.full_name.toLowerCase().includes(value.toLowerCase()) ||
      record.specialty.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  useEffect(() => {
    setFilteredData(employeeData);
  }, [employeeData]);

  const formatConversionFactor = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  const columns = [
    {
      title: 'Provider Information',
      children: [
        {
          title: 'Provider ID',
          dataIndex: 'employee_id',
          key: 'employee_id',
          width: 120,
          sorter: (a: EmployeeData, b: EmployeeData) => a.employee_id.localeCompare(b.employee_id)
        },
        {
          title: 'Name',
          dataIndex: 'full_name',
          key: 'full_name',
          width: 150,
          sorter: (a: EmployeeData, b: EmployeeData) => a.full_name.localeCompare(b.full_name)
        },
        {
          title: 'Specialty',
          dataIndex: 'specialty',
          key: 'specialty',
          width: 150,
          sorter: (a: EmployeeData, b: EmployeeData) => a.specialty.localeCompare(b.specialty)
        }
      ]
    },
    {
      title: 'Compensation',
      align: 'right' as const,
      children: [
        {
          title: 'Base Pay',
          dataIndex: 'base_pay',
          key: 'base_pay',
          width: 120,
          align: 'right' as const,
          render: (value: number) => formatCurrency(value),
          sorter: (a: EmployeeData, b: EmployeeData) => a.base_pay - b.base_pay
        },
        {
          title: 'wRVU Incentive',
          dataIndex: 'wrvu_incentive',
          key: 'wrvu_incentive',
          width: 120,
          align: 'right' as const,
          render: (value: number) => formatCurrency(value),
          sorter: (a: EmployeeData, b: EmployeeData) => a.wrvu_incentive - b.wrvu_incentive
        },
        {
          title: 'Quality',
          dataIndex: 'quality_payments',
          key: 'quality_payments',
          width: 120,
          align: 'right' as const,
          render: (value: number) => formatCurrency(value),
          sorter: (a: EmployeeData, b: EmployeeData) => a.quality_payments - b.quality_payments
        },
        {
          title: 'Admin',
          dataIndex: 'admin_payments',
          key: 'admin_payments',
          width: 120,
          align: 'right' as const,
          render: (value: number) => formatCurrency(value),
          sorter: (a: EmployeeData, b: EmployeeData) => a.admin_payments - b.admin_payments
        }
      ]
    },
    {
      title: 'Productivity',
      align: 'right' as const,
      children: [
        {
          title: 'Annual wRVUs',
          dataIndex: 'annual_wrvus',
          key: 'annual_wrvus',
          width: 120,
          align: 'right' as const,
          render: (value: number) => formatNumber(value),
          sorter: (a: EmployeeData, b: EmployeeData) => a.annual_wrvus - b.annual_wrvus
        },
        {
          title: 'Conversion Factor',
          dataIndex: 'conversion_factor',
          key: 'conversion_factor',
          width: 120,
          align: 'right' as const,
          render: (value: number) => formatConversionFactor(value),
          sorter: (a: EmployeeData, b: EmployeeData) => a.conversion_factor - b.conversion_factor
        }
      ]
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-12">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Provider Data Management Preview</h1>
        <p className="text-sm text-gray-500 mb-6">Upload and manage provider data</p>

        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-500"
            >
              Upload Provider Data
            </Button>

            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownloadExcel}
            >
              Download Excel
            </Button>

            <Button
              icon={<DeleteOutlined />}
              onClick={handleClearData}
            >
              Clear Data
            </Button>
          </div>

          <Input
            placeholder="Search providers..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchText}
            onChange={e => handleSearch(e.target.value)}
            style={{ width: 250 }}
            className="rounded-md"
          />
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

        <style>
          {`
            .provider-table .ant-table {
              border: 1px solid #e5e7eb !important;
            }
            
            /* Regular column headers */
            .provider-table .ant-table-thead > tr > th {
              background-color: #f9fafb !important;
              border-bottom: 1px solid #e5e7eb;
              font-weight: 500;
            }

            /* Main section headers */
            .provider-table .ant-table-thead > tr:first-child > th {
              background-color: #f3f4f6 !important;
              font-weight: 600;
              border-bottom: 2px solid #e5e7eb;
              text-align: center !important;
              padding: 12px 16px;
              text-transform: uppercase;
              font-size: 13px;
              letter-spacing: 0.5px;
            }

            /* Cell borders */
            .provider-table .ant-table-cell {
              border-color: #e5e7eb !important;
            }

            /* Section dividers - strong vertical lines */
            .provider-table .ant-table-thead > tr > th:nth-child(4),
            .provider-table .ant-table-thead > tr > th:nth-child(8),
            .provider-table .ant-table-tbody > tr > td:nth-child(4),
            .provider-table .ant-table-tbody > tr > td:nth-child(8) {
              border-left: 2px solid #d1d5db !important;
            }

            /* Hover effect on rows */
            .provider-table .ant-table-tbody > tr:hover > td {
              background-color: #f9fafb !important;
            }

            /* Even rows for better readability */
            .provider-table .ant-table-tbody > tr:nth-child(even) > td {
              background-color: #fafafa;
            }
          `}
        </style>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="employee_id"
          pagination={{ pageSize: 10 }}
          bordered
          className="provider-table"
          scroll={{ x: 'max-content' }}
        />
      </div>
    </div>
  );
};

export default EmployeeData; 