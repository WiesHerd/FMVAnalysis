import React, { useState, useEffect } from 'react';
import { Upload, Card, Table, Input, Button, Alert } from 'antd';
import { UploadOutlined, PrinterOutlined } from '@ant-design/icons';
import Papa, { ParseResult } from 'papaparse';

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

          const parsedData = results.data.map((row: any) => {
            const basePay = parseFloat(row.base_pay) || 0;
            const wrvuIncentive = parseFloat(row.wrvu_incentive) || 0;
            const qualityPayments = parseFloat(row.quality_payments) || 0;
            const adminPayments = parseFloat(row.admin_payments) || 0;
            const annualWrvus = parseFloat(row.annual_wrvus) || 0;
            const conversionFactor = parseFloat(row.conversion_factor) || 0;

            return {
              employee_id: row.employee_id?.toString().trim() || '',
              full_name: row.full_name?.toString().trim() || '',
              specialty: row.specialty?.toString().trim() || '',
              base_pay: basePay,
              wrvu_incentive: wrvuIncentive,
              quality_payments: qualityPayments,
              admin_payments: adminPayments,
              annual_wrvus: annualWrvus,
              conversion_factor: conversionFactor
            };
          });

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

  const filteredData = employeeData.filter(record =>
    record.full_name.toLowerCase().includes(searchText.toLowerCase()) ||
    record.specialty.toLowerCase().includes(searchText.toLowerCase()) ||
    record.employee_id.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="h-full p-4">
      <div className="screen-only">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Employee Data Management</h2>
          <Button
            type="default"
            icon={<PrinterOutlined />}
            onClick={() => window.print()}
            className="print-button"
          >
            Print Employee Data
          </Button>
        </div>

        <div className="grid gap-4">
          <Card title="Upload Employee Data">
            <div className="mb-4">
              <Upload.Dragger
                accept=".csv"
                beforeUpload={handleFileUpload}
                showUploadList={false}
              >
                <p className="ant-upload-drag-icon">
                  <UploadOutlined />
                </p>
                <p className="ant-upload-text">Click or drag a CSV file to upload</p>
                <p className="ant-upload-hint">
                  File should contain employee data with required fields
                </p>
              </Upload.Dragger>
            </div>

            {uploadStatus && (
              <Alert
                message={statusMessage}
                type={uploadStatus}
                showIcon
              />
            )}
          </Card>

          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Data Preview</h3>
              <Input.Search
                placeholder="Search employees..."
                allowClear
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={{ width: 200 }}
              />
            </div>
            
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
          </Card>
        </div>
      </div>

      <div className="print-only">
        <h2 className="text-2xl font-semibold text-center mb-4">Employee Data Management</h2>
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="employee_id"
          pagination={false}
          bordered
          size="small"
          className="market-data-table"
          showSorterTooltip={false}
        />
      </div>

      <style jsx global>{`
        @media screen {
          .print-only {
            display: none !important;
          }
        }

        @media print {
          @page {
            size: landscape;
            margin: 0.5in;
          }

          /* Hide all navigation and UI elements */
          nav,
          header,
          .ant-dropdown-trigger,
          .screen-only {
            display: none !important;
          }

          /* Hide the FMV Analyzer header */
          :global(.ant-layout-header),
          :global(.ant-menu) {
            display: none !important;
          }

          .print-only {
            display: block !important;
            padding-top: 0 !important;
          }

          /* Remove any extra spacing at the top */
          .h-full {
            padding: 0 !important;
            margin: 0 !important;
          }

          /* Ensure the title is properly positioned */
          .text-2xl {
            margin-top: 0 !important;
            margin-bottom: 20px !important;
          }

          /* Table styles */
          .market-data-table {
            width: 100% !important;
            margin: 0 !important;
          }

          .market-data-table .ant-table {
            border: 1px solid #d9d9d9 !important;
            border-left: 1px solid #d9d9d9 !important;
          }

          /* Group header styling */
          .market-data-table .ant-table-thead > tr:first-child > th {
            background: #f0f0f0 !important;
            text-align: center;
            padding: 12px 8px !important;
            border-bottom: 1px solid #d9d9d9 !important;
            border-top: none !important;
            font-weight: 600;
          }

          /* Subheader styling */
          .market-data-table .ant-table-thead > tr:last-child > th {
            background: #f5f5f5 !important;
            text-align: center;
            padding: 8px !important;
            font-weight: 500;
          }

          /* Major section separators */
          .market-data-table td[data-key="section-end"],
          .market-data-table .ant-table-thead th[data-key="section-end"] {
            border-right: 2px solid #d9d9d9 !important;
          }

          /* Regular column borders */
          .market-data-table .ant-table-cell {
            border-right: 1px solid #f0f0f0 !important;
          }

          /* First column styling */
          .market-data-table .specialty-column {
            text-align: left !important;
            background: white;
            position: sticky;
            left: 0;
            z-index: 1;
            border-right: 1px solid #f0f0f0 !important;
          }

          /* Ensure borders in print */
          @media print {
            .market-data-table td[data-key="section-end"],
            .market-data-table .ant-table-thead th[data-key="section-end"] {
              border-right: 2px solid #d9d9d9 !important;
            }

            .market-data-table .ant-table-cell {
              border-right: 1px solid #f0f0f0 !important;
            }

            .market-data-table .specialty-column {
              border-right: 1px solid #f0f0f0 !important;
            }
          }
        }

        /* Regular table styles */
        .market-data-table {
          height: 100%;
        }
        
        .market-data-table .ant-table {
          border: 1px solid #d9d9d9;
          border-left: 1px solid #d9d9d9 !important;
        }

        /* Remove zebra striping and set consistent background */
        .market-data-table .ant-table-tbody > tr > td {
          background: white !important;
        }

        .market-data-table .ant-table-tbody > tr:hover > td {
          background: #fafafa !important;
        }

        /* Remove double borders */
        .market-data-table .ant-table-container {
          border: none !important;
        }

        .market-data-table .ant-table-thead {
          border-top: none !important;
        }
        
        .market-data-table .ant-table-cell {
          text-align: right;
          padding: 8px !important;
          white-space: nowrap;
          border-right: 1px solid #f0f0f0 !important;
        }

        /* Group header styling */
        .market-data-table .ant-table-thead > tr:first-child > th {
          background: #f0f0f0 !important;
          text-align: center;
          padding: 12px 8px !important;
          border-bottom: 1px solid #d9d9d9 !important;
          border-top: none !important;
          font-weight: 600;
        }

        /* Subheader styling */
        .market-data-table .ant-table-thead > tr:last-child > th {
          background: #f5f5f5 !important;
          text-align: center;
          padding: 8px !important;
          font-weight: 500;
        }

        /* Major section separators */
        .market-data-table td[data-key="admin_payments"],
        .market-data-table .ant-table-thead th[data-key="admin_payments"] {
          border-right: 2px solid #d9d9d9 !important;
        }

        /* First column styling */
        .market-data-table .specialty-column {
          text-align: left !important;
          background: white;
          position: sticky;
          left: 0;
          z-index: 1;
          border-right: 2px solid #d9d9d9 !important;
        }

        /* Ensure text alignment */
        .market-data-table .ant-table-cell {
          text-align: right;
          padding: 8px !important;
          white-space: nowrap;
        }

        .market-data-table .ant-table-thead > tr > th.specialty-column,
        .market-data-table td.specialty-column {
          text-align: left !important;
        }

        /* Ensure proper column borders */
        .market-data-table .ant-table-thead > tr:first-child > th {
          border-right: 1px solid #d9d9d9 !important;
        }

        .market-data-table .ant-table-thead > tr:last-child > th {
          border-right: 1px solid #f0f0f0 !important;
        }

        @media print {
          /* ... existing print styles ... */

          /* Ensure consistent background in print */
          .market-data-table .ant-table-tbody > tr > td {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Remove hover effect in print */
          .market-data-table .ant-table-tbody > tr:hover > td {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }

        .employee-data-table {
          height: 100%;
        }
        
        .employee-data-table .ant-table {
          border: 1px solid #d9d9d9;
        }

        .employee-data-table .ant-table-cell {
          text-align: right;
          padding: 8px !important;
          white-space: nowrap;
        }

        /* Remove vertical lines between Employee ID, Name, and Specialty */
        .employee-data-table td.specialty-column,
        .employee-data-table td[data-key="employee_id"],
        .employee-data-table td[data-key="full_name"] {
          border-right: none !important;
        }

        .employee-data-table .ant-table-thead th.specialty-column,
        .employee-data-table .ant-table-thead th[data-key="employee_id"],
        .employee-data-table .ant-table-thead th[data-key="full_name"] {
          border-right: none !important;
        }

        /* Major section separators */
        .employee-data-table td[data-key="section-end"],
        .employee-data-table .ant-table-thead th[data-key="section-end"] {
          border-right: 2px solid #d9d9d9 !important;
        }

        /* Group header styling */
        .employee-data-table .ant-table-thead > tr:first-child > th {
          background: #f0f0f0 !important;
          text-align: center !important;
          padding: 12px 8px !important;
          border-bottom: 2px solid #d9d9d9 !important;
          font-weight: 600;
          border-right: none !important;
        }

        /* Add vertical separators in group headers */
        .employee-data-table .ant-table-thead > tr:first-child > th:nth-child(1),
        .employee-data-table .ant-table-thead > tr:first-child > th:nth-child(2) {
          border-right: 2px solid #d9d9d9 !important;
        }

        /* Major section separators */
        .employee-data-table td[data-key="section-end"],
        .employee-data-table .ant-table-thead th[data-key="section-end"] {
          border-right: 2px solid #d9d9d9 !important;
        }

        /* Ensure section separators extend in print */
        @media print {
          .employee-data-table .ant-table-thead > tr:first-child > th:nth-child(1),
          .employee-data-table .ant-table-thead > tr:first-child > th:nth-child(2) {
            border-right: 2px solid #d9d9d9 !important;
          }
        }

        /* Subheader row styling */
        .employee-data-table .ant-table-thead > tr:last-child > th {
          background: #f5f5f5 !important;
          text-align: right !important;
          padding: 8px !important;
          border-bottom: 1px solid #d9d9d9 !important;
        }

        /* Keep Employee Information header centered */
        .employee-data-table .ant-table-thead > tr:first-child > th:first-child {
          text-align: center !important;
        }

        /* Keep Employee ID, Name, and Specialty headers left-aligned */
        .employee-data-table .ant-table-thead > tr:last-child > th.specialty-column,
        .employee-data-table .ant-table-thead > tr:last-child > th[data-key="employee_id"],
        .employee-data-table .ant-table-thead > tr:last-child > th[data-key="full_name"] {
          text-align: left !important;
        }

        /* Right-align all other column headers */
        .employee-data-table .ant-table-thead > tr:last-child > th {
          text-align: right !important;
        }

        /* Specialty column styling */
        .employee-data-table .specialty-column {
          text-align: left;
          background: white;
          position: sticky;
          left: 0;
          z-index: 1;
        }

        /* Header section separators */
        .employee-data-table .ant-table-thead > tr > th.specialty-column {
          text-align: left;
          position: sticky;
          left: 0;
          z-index: 2;
        }

        @media print {
          @page {
            size: landscape;
            margin: 0.5in;
          }

          .screen-only {
            display: none !important;
          }

          .print-only {
            display: block !important;
          }

          .employee-data-table {
            width: 100% !important;
          }

          .employee-data-table .ant-table {
            border: 1px solid #d9d9d9 !important;
          }

          .employee-data-table .ant-table-cell {
            color: black !important;
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Maintain section separators in print */
          .employee-data-table td[data-key="section-end"],
          .employee-data-table .ant-table-thead th[data-key="section-end"] {
            border-right: 2px solid #d9d9d9 !important;
          }

          /* Remove vertical lines between Employee ID, Name, and Specialty in print */
          .employee-data-table td.specialty-column,
          .employee-data-table td[data-key="employee_id"],
          .employee-data-table td[data-key="full_name"] {
            border-right: none !important;
          }

          .employee-data-table .ant-table-thead th.specialty-column,
          .employee-data-table .ant-table-thead th[data-key="employee_id"],
          .employee-data-table .ant-table-thead th[data-key="full_name"] {
            border-right: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default EmployeeDataPage; 