import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { UploadOutlined, DownloadOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

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
  const [filteredData, setFilteredData] = useState<MarketDataRow[]>([]);
  const [searchText, setSearchText] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'success' | 'error' | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data from localStorage when component mounts
  useEffect(() => {
    console.log('Loading market data from storage');
    const savedData = localStorage.getItem('marketData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        console.log('Found saved market data:', parsedData);
        setData(parsedData);
        setFilteredData(parsedData);
      } catch (err) {
        console.error('Error loading market data:', err);
      }
    }
  }, []);

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const rows = text.split('\n').filter(row => row.trim());
          const dataRows = rows.slice(1);
          const parsedData = dataRows.map(row => {
            const [specialty, ...values] = row.split(',').map(val => val.trim());
            const numbers = values.map(val => {
              const num = Number(val.replace(/[$,]/g, ''));
              return isNaN(num) ? 0 : num;
            });
            const [total25, total50, total75, total90, wrvu25, wrvu50, wrvu75, wrvu90, cf25, cf50, cf75, cf90] = numbers;
            
            return {
              specialty: specialty,
              total_25th: total25,
              total_50th: total50,
              total_75th: total75,
              total_90th: total90,
              wrvus_25th: wrvu25,
              wrvus_50th: wrvu50,
              wrvus_75th: wrvu75,
              wrvus_90th: wrvu90,
              cf_25th: cf25,
              cf_50th: cf50,
              cf_75th: cf75,
              cf_90th: cf90,
            };
          }).filter(row => row.specialty && row.specialty.toLowerCase() !== 'specialty');

          setData(parsedData);
          setFilteredData(parsedData);
          localStorage.setItem('marketData', JSON.stringify(parsedData));
          setUploadStatus('success');
          setStatusMessage('Market data uploaded successfully');
        } catch (error) {
          console.error('Error parsing file:', error);
          setUploadStatus('error');
          setStatusMessage('Error parsing file. Please check the format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDownloadExcel = () => {
    const excelData = filteredData.map(row => ({
      'Specialty': row.specialty,
      'Total Cash - 25th': row.total_25th || 0,
      'Total Cash - 50th': row.total_50th || 0,
      'Total Cash - 75th': row.total_75th || 0,
      'Total Cash - 90th': row.total_90th || 0,
      'wRVUs - 25th': row.wrvus_25th || 0,
      'wRVUs - 50th': row.wrvus_50th || 0,
      'wRVUs - 75th': row.wrvus_75th || 0,
      'wRVUs - 90th': row.wrvus_90th || 0,
      'Conversion Factor - 25th': row.cf_25th || 0,
      'Conversion Factor - 50th': row.cf_50th || 0,
      'Conversion Factor - 75th': row.cf_75th || 0,
      'Conversion Factor - 90th': row.cf_90th || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    const colWidths = [
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
    ];
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Market Data');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(dataBlob, 'market_data.xlsx');
  };

  const handleClearData = () => {
    setData([]);
    setFilteredData([]);
    localStorage.removeItem('marketData');
    setUploadStatus(null);
    setStatusMessage('');
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    const filtered = data.filter(record => 
      record.specialty.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  // Keep filtered data in sync with main data
  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  const columns: ColumnsType<MarketDataRow> = [
    {
      title: 'Specialty',
      dataIndex: 'specialty',
      key: 'specialty',
      sorter: (a, b) => a.specialty.localeCompare(b.specialty),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div className="p-2">
          <Input
            placeholder="Search specialty"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            className="mb-2 block"
          />
          <div className="flex justify-between">
            <Button
              type="primary"
              onClick={() => confirm()}
              size="small"
              className="bg-blue-500"
            >
              Filter
            </Button>
            <Button
              onClick={() => clearFilters?.()}
              size="small"
            >
              Reset
            </Button>
          </div>
        </div>
      ),
      filterIcon: (filtered: boolean) => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      onFilter: (value, record) =>
        record.specialty.toLowerCase().includes(String(value).toLowerCase()),
    },
    {
      title: (
        <div className="bg-gray-50 font-medium text-gray-900">
          Total Cash Compensation
        </div>
      ),
      colSpan: 4,
      children: [
        {
          title: '25th',
          dataIndex: 'total_25th',
          key: 'total_25th',
          render: (value: number) => `$${value.toLocaleString()}`,
        },
        {
          title: '50th',
          dataIndex: 'total_50th',
          key: 'total_50th',
          render: (value: number) => `$${value.toLocaleString()}`,
        },
        {
          title: '75th',
          dataIndex: 'total_75th',
          key: 'total_75th',
          render: (value: number) => `$${value.toLocaleString()}`,
        },
        {
          title: '90th',
          dataIndex: 'total_90th',
          key: 'total_90th',
          render: (value: number) => `$${value.toLocaleString()}`,
        },
      ],
    },
    {
      title: (
        <div className="bg-gray-50 font-medium text-gray-900">
          wRVUs
        </div>
      ),
      colSpan: 4,
      children: [
        {
          title: '25th',
          dataIndex: 'wrvus_25th',
          key: 'wrvus_25th',
          render: (value: number) => value.toLocaleString(),
        },
        {
          title: '50th',
          dataIndex: 'wrvus_50th',
          key: 'wrvus_50th',
          render: (value: number) => value.toLocaleString(),
        },
        {
          title: '75th',
          dataIndex: 'wrvus_75th',
          key: 'wrvus_75th',
          render: (value: number) => value.toLocaleString(),
        },
        {
          title: '90th',
          dataIndex: 'wrvus_90th',
          key: 'wrvus_90th',
          render: (value: number) => value.toLocaleString(),
        },
      ],
    },
    {
      title: (
        <div className="bg-gray-50 font-medium text-gray-900">
          Conversion Factor
        </div>
      ),
      colSpan: 4,
      children: [
        {
          title: '25th',
          dataIndex: 'cf_25th',
          key: 'cf_25th',
          render: (value: number) => `$${value.toFixed(2)}`,
        },
        {
          title: '50th',
          dataIndex: 'cf_50th',
          key: 'cf_50th',
          render: (value: number) => `$${value.toFixed(2)}`,
        },
        {
          title: '75th',
          dataIndex: 'cf_75th',
          key: 'cf_75th',
          render: (value: number) => `$${value.toFixed(2)}`,
        },
        {
          title: '90th',
          dataIndex: 'cf_90th',
          key: 'cf_90th',
          render: (value: number) => `$${value.toFixed(2)}`,
        },
      ],
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-12">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Market Data Management Preview</h1>
        <p className="text-sm text-gray-500 mb-6">Upload and manage market data</p>

        <div className="flex justify-between items-center mb-6">
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
              icon={<DownloadOutlined />}
              onClick={handleDownloadExcel}
              disabled={data.length === 0}
            >
              Download Excel
            </Button>

            <Button
              icon={<DeleteOutlined />}
              onClick={handleClearData}
              disabled={data.length === 0}
            >
              Clear Data
            </Button>
          </div>

          <Input
            placeholder="Search specialties..."
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

        <Table<MarketDataRow>
          columns={columns}
          dataSource={filteredData}
          rowKey="specialty"
          pagination={{ pageSize: 10 }}
          bordered
          className="market-data-table"
          scroll={{ x: 'max-content' }}
          style={{
            '--border-color': '#e5e7eb',
            '--divider-color': '#d1d5db'
          } as React.CSSProperties}
        />

        <style>
          {`
            .market-data-table .ant-table {
              border: 1px solid #e5e7eb;
            }

            /* Remove all default vertical borders */
            .market-data-table .ant-table-cell {
              border-right: none !important;
            }

            /* Add vertical lines after Specialty and after each major section */
            .market-data-table .ant-table-thead > tr:first-child > th:nth-child(1),
            .market-data-table .ant-table-tbody > tr > td:nth-child(1) {
              border-right: 2px solid #d1d5db !important;
            }

            .market-data-table .ant-table-thead > tr:first-child > th:nth-child(2),
            .market-data-table .ant-table-tbody > tr > td:nth-child(5) {
              border-right: 2px solid #d1d5db !important;
            }

            .market-data-table .ant-table-thead > tr:first-child > th:nth-child(3),
            .market-data-table .ant-table-tbody > tr > td:nth-child(9) {
              border-right: 2px solid #d1d5db !important;
            }

            /* Keep the header styling */
            .market-data-table .ant-table-thead > tr:first-child > th {
              background-color: #f3f4f6;
              font-weight: 600;
              text-transform: uppercase;
              font-size: 13px;
              letter-spacing: 0.5px;
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default MarketData; 