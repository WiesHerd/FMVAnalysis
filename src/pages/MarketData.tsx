import React, { useState, useEffect } from 'react';
import { Upload, Card, Table, Input, Button, Alert } from 'antd';
import { UploadOutlined, PrinterOutlined } from '@ant-design/icons';
import Papa from 'papaparse';

interface MarketDataRecord {
  specialty: string;
  percentile_25th: number;
  percentile_50th: number;
  percentile_75th: number;
  percentile_90th: number;
  wrvu_25th: number;
  wrvu_50th: number;
  wrvu_75th: number;
  wrvu_90th: number;
  cf_25th: number;
  cf_50th: number;
  cf_75th: number;
  cf_90th: number;
}

const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '-';
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '-';
  return value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const formatCF = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '-';
  return `$${value.toFixed(2)}`;
};

const MarketData: React.FC = () => {
  const [data, setData] = useState<MarketDataRecord[]>([]);
  const [searchText, setSearchText] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'success' | 'error' | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const storedData = localStorage.getItem('marketData');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setData(parsed);
        setUploadStatus('success');
        setStatusMessage('Loaded records from storage');
      } catch (error) {
        console.error('Error loading stored data:', error);
        setUploadStatus('error');
        setStatusMessage('Error loading stored data');
      }
    }
  }, []);

  const handleFileUpload = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.error('CSV parsing errors:', results.errors);
          setUploadStatus('error');
          setStatusMessage('Error parsing CSV file');
          return;
        }

        try {
          console.log('Raw CSV data:', results.data[0]); // Debug log

          const parsedData = results.data.map((row: any) => ({
            specialty: row.specialty?.trim() || '',
            percentile_25th: parseFloat(row.p25_total) || 0,
            percentile_50th: parseFloat(row.p50_total) || 0,
            percentile_75th: parseFloat(row.p75_total) || 0,
            percentile_90th: parseFloat(row.p90_total) || 0,
            wrvu_25th: parseFloat(row.p25_wrvu) || 0,
            wrvu_50th: parseFloat(row.p50_wrvu) || 0,
            wrvu_75th: parseFloat(row.p75_wrvu) || 0,
            wrvu_90th: parseFloat(row.p90_wrvu) || 0,
            cf_25th: parseFloat(row.p25_cf) || 0,
            cf_50th: parseFloat(row.p50_cf) || 0,
            cf_75th: parseFloat(row.p75_cf) || 0,
            cf_90th: parseFloat(row.p90_cf) || 0,
          }));

          console.log('Parsed data:', parsedData[0]); // Debug log

          // Validate required fields
          const validData = parsedData.filter(record => 
            record.specialty && 
            !isNaN(record.percentile_50th) && 
            !isNaN(record.wrvu_50th) && 
            !isNaN(record.cf_50th)
          );

          if (validData.length === 0) {
            setUploadStatus('error');
            setStatusMessage('No valid records found in CSV');
            return;
          }

          // Transform data into the format needed for benchmarks
          const transformedData = validData.map(record => ({
            specialty: record.specialty,
            benchmarks: [
              {
                percentile: '25th',
                tcc: record.percentile_25th,
                wrvus: record.wrvu_25th,
                conversionFactor: record.cf_25th,
                clinicalFte: 1.0
              },
              {
                percentile: '50th',
                tcc: record.percentile_50th,
                wrvus: record.wrvu_50th,
                conversionFactor: record.cf_50th,
                clinicalFte: 1.0
              },
              {
                percentile: '75th',
                tcc: record.percentile_75th,
                wrvus: record.wrvu_75th,
                conversionFactor: record.cf_75th,
                clinicalFte: 1.0
              },
              {
                percentile: '90th',
                tcc: record.percentile_90th,
                wrvus: record.wrvu_90th,
                conversionFactor: record.cf_90th,
                clinicalFte: 1.0
              }
            ]
          }));

          setData(validData);
          localStorage.setItem('marketData', JSON.stringify(transformedData));
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

  const columns = [
    {
      title: 'Specialty',
      dataIndex: 'specialty',
      key: 'specialty',
      fixed: 'left',
      width: 180,
      className: 'specialty-column'
    },
    {
      title: 'Total Cash Compensation',
      children: [
        {
          title: '25th',
          dataIndex: 'percentile_25th',
          key: 'percentile_25th',
          width: 110,
          render: (value: number) => formatCurrency(value)
        },
        {
          title: '50th',
          dataIndex: 'percentile_50th',
          key: 'percentile_50th',
          width: 110,
          render: (value: number) => formatCurrency(value)
        },
        {
          title: '75th',
          dataIndex: 'percentile_75th',
          key: 'percentile_75th',
          width: 110,
          render: (value: number) => formatCurrency(value)
        },
        {
          title: '90th',
          dataIndex: 'percentile_90th',
          key: 'percentile_90th',
          width: 110,
          render: (value: number) => formatCurrency(value),
          onCell: () => ({ 'data-key': 'section-end' }),
          onHeaderCell: () => ({ 'data-key': 'section-end' })
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
          width: 90,
          render: (value: number) => formatNumber(value)
        },
        {
          title: '50th',
          dataIndex: 'wrvu_50th',
          key: 'wrvu_50th',
          width: 90,
          render: (value: number) => formatNumber(value)
        },
        {
          title: '75th',
          dataIndex: 'wrvu_75th',
          key: 'wrvu_75th',
          width: 90,
          render: (value: number) => formatNumber(value)
        },
        {
          title: '90th',
          dataIndex: 'wrvu_90th',
          key: 'wrvu_90th',
          width: 90,
          render: (value: number) => formatNumber(value),
          onCell: () => ({ 'data-key': 'section-end' }),
          onHeaderCell: () => ({ 'data-key': 'section-end' })
        }
      ]
    },
    {
      title: 'Conversion Factor',
      children: [
        {
          title: '25th',
          dataIndex: 'cf_25th',
          key: 'cf_25th',
          width: 90,
          render: (value: number) => formatCF(value)
        },
        {
          title: '50th',
          dataIndex: 'cf_50th',
          key: 'cf_50th',
          width: 90,
          render: (value: number) => formatCF(value)
        },
        {
          title: '75th',
          dataIndex: 'cf_75th',
          key: 'cf_75th',
          width: 90,
          render: (value: number) => formatCF(value)
        },
        {
          title: '90th',
          dataIndex: 'cf_90th',
          key: 'cf_90th',
          width: 90,
          render: (value: number) => formatCF(value)
        }
      ]
    }
  ];

  const filteredData = data.filter(record => 
    record.specialty.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="h-full p-4">
      <div className="screen-only">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Market Data Management</h2>
          <Button
            type="default"
            icon={<PrinterOutlined />}
            onClick={() => window.print()}
            className="print-button"
          >
            Print Market Data
          </Button>
        </div>

        <div className="grid gap-4">
          <Card title="Upload Market Data">
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
                  File should contain specialty benchmarks with percentiles
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
                placeholder="Search specialties..."
                allowClear
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={{ width: 200 }}
              />
            </div>
            
            <Table
              dataSource={filteredData}
              columns={columns}
              rowKey="specialty"
              scroll={{ x: 'max-content' }}
              pagination={false}
              bordered
              size="small"
              className="market-data-table"
              showSorterTooltip={false}
            />
          </Card>
        </div>
      </div>

      <div className="print-only">
        <h2 className="text-2xl font-semibold text-center mb-4">Market Data Management</h2>
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="specialty"
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
            background-color: #f0f0f0 !important;
            border-bottom: 2px solid #d9d9d9 !important;
            padding: 12px 8px !important;
            border-top: none !important;
          }

          /* Remove extra borders in header */
          .market-data-table .ant-table-thead > tr:first-child {
            border-top: none !important;
          }

          .market-data-table .ant-table-thead > tr:first-child > th {
            border-top: none !important;
            border-bottom: 1px solid #d9d9d9 !important;
          }

          /* Cell styling */
          .market-data-table .ant-table-cell {
            color: black !important;
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            border-right: 1px solid #f0f0f0 !important;
          }

          /* Major section separators */
          .market-data-table td[data-key="percentile_90th"],
          .market-data-table td[data-key="wrvu_90th"],
          .market-data-table .ant-table-thead th[data-key="percentile_90th"],
          .market-data-table .ant-table-thead th[data-key="wrvu_90th"],
          .market-data-table .specialty-column {
            border-right: 2px solid #d9d9d9 !important;
          }

          /* Remove double borders */
          .market-data-table .ant-table-container {
            border: none !important;
          }

          .market-data-table .ant-table-thead {
            border-top: none !important;
          }

          /* Ensure first column has left border */
          .market-data-table .specialty-column {
            border-left: 1px solid #d9d9d9 !important;
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

          /* Group header borders */
          .market-data-table .ant-table-thead > tr:first-child > th {
            border-right: 1px solid #d9d9d9 !important;
          }

          /* Ensure borders in print */
          @media print {
            .market-data-table td[data-key="section-end"],
            .market-data-table .ant-table-thead th[data-key="section-end"] {
              border-right: 2px solid #d9d9d9 !important;
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
          border-right: none !important;
        }

        /* Major section separators */
        .market-data-table td[data-key="percentile_90th"],
        .market-data-table td[data-key="wrvu_90th"],
        .market-data-table .ant-table-thead th[data-key="percentile_90th"],
        .market-data-table .ant-table-thead th[data-key="wrvu_90th"] {
          border-right: 2px solid #d9d9d9 !important;
        }

        /* Specialty column separator */
        .market-data-table .specialty-column,
        .market-data-table .ant-table-thead > tr:first-child > th:first-child {
          text-align: left !important;
          background: white;
          position: sticky;
          left: 0;
          z-index: 1;
          border-right: 2px solid #d9d9d9 !important;
        }

        /* Ensure specialty column separator extends in print */
        @media print {
          .market-data-table .specialty-column,
          .market-data-table .ant-table-thead > tr:first-child > th:first-child {
            border-right: 2px solid #d9d9d9 !important;
          }
        }

        /* Group header styling */
        .market-data-table .ant-table-thead > tr:first-child > th {
          background: #f0f0f0 !important;
          text-align: center !important;
          padding: 12px 8px !important;
          border-bottom: 2px solid #d9d9d9 !important;
          border-top: none !important;
          font-weight: 600;
          border-right: none !important;
        }

        /* Right-align percentile headers */
        .market-data-table .ant-table-thead > tr:last-child > th {
          text-align: right !important;
        }

        /* Keep specialty header left-aligned */
        .market-data-table .ant-table-thead > tr:last-child > th.specialty-column {
          text-align: left !important;
        }

        /* Add vertical separators in group headers */
        .market-data-table .ant-table-thead > tr:first-child > th:nth-child(2),
        .market-data-table .ant-table-thead > tr:first-child > th:nth-child(3) {
          border-right: 2px solid #d9d9d9 !important;
        }

        /* Major section separators */
        .market-data-table td[data-key="section-end"],
        .market-data-table .ant-table-thead th[data-key="section-end"] {
          border-right: 2px solid #d9d9d9 !important;
        }

        /* Ensure section separators extend in print */
        @media print {
          .market-data-table .ant-table-thead > tr:first-child > th:nth-child(2),
          .market-data-table .ant-table-thead > tr:first-child > th:nth-child(3) {
            border-right: 2px solid #d9d9d9 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MarketData; 