import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Input } from 'antd';
import { Link } from 'react-router-dom';
import { UsergroupAddOutlined, AlertOutlined, CheckCircleOutlined, ClockCircleOutlined, SearchOutlined } from '@ant-design/icons';
import '../styles/ProviderTable.css';
import { formatCurrency, formatNumber } from '../../src/utils/formatters';

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

interface Provider {
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

interface ProviderMetrics {
  id: string;
  name: string;
  specialty: string;
  tcc: number;
  tcc_percentile: number;
  annual_wrvus: number;
  wrvu_percentile: number;
  tcc_per_wrvu: number;
  tcc_per_wrvu_percentile: number;
  risk_level: string;
  status: string;
  last_review_date: string | null;
}

const Dashboard: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [providerMetrics, setProviderMetrics] = useState<ProviderMetrics[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [metrics, setMetrics] = useState({
    totalProviders: 0,
    atRiskProviders: 0,
    pendingReviews: 0,
    completedReviews: 0
  });

  // Linear interpolation function to calculate exact percentile
  const calculateExactPercentile = (value: number, benchmarks: { value: number; percentile: number }[]): number => {
    // Sort benchmarks by value
    const sortedBenchmarks = [...benchmarks].sort((a, b) => a.value - b.value);

    // If value is less than lowest benchmark
    if (value <= sortedBenchmarks[0].value) {
      return sortedBenchmarks[0].percentile;
    }

    // If value is greater than highest benchmark
    if (value >= sortedBenchmarks[sortedBenchmarks.length - 1].value) {
      return sortedBenchmarks[sortedBenchmarks.length - 1].percentile;
    }

    // Find the two benchmarks to interpolate between
    for (let i = 0; i < sortedBenchmarks.length - 1; i++) {
      const lower = sortedBenchmarks[i];
      const upper = sortedBenchmarks[i + 1];
      
      if (value >= lower.value && value <= upper.value) {
        // Linear interpolation formula: percentile = p1 + (value - v1) * (p2 - p1) / (v2 - v1)
        return lower.percentile + 
          (value - lower.value) * 
          (upper.percentile - lower.percentile) / 
          (upper.value - lower.value);
      }
    }

    return 0; // Fallback
  };

  // Calculate risk level based on metrics
  const calculateRiskLevel = (tccPercentile: number, wrvuPercentile: number, tccPerWrvuPercentile: number): string => {
    if (tccPercentile > 90 || wrvuPercentile < 25 || tccPerWrvuPercentile > 90) return 'High';
    if (tccPercentile > 75 || wrvuPercentile < 50 || tccPerWrvuPercentile > 75) return 'Medium';
    return 'Low';
  };

  useEffect(() => {
    // Load provider data from localStorage
    const savedData = localStorage.getItem('employeeData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setProviders(parsedData);
      } catch (err) {
        console.error('Error loading provider data:', err);
      }
    }

    // Mock market data for each specialty
    const mockMarketData: MarketData[] = [
      {
        specialty: 'Dermatology',
        tcc_25th: 350000,
        tcc_50th: 425000,
        tcc_75th: 500000,
        tcc_90th: 575000,
        wrvu_25th: 4500,
        wrvu_50th: 5500,
        wrvu_75th: 6500,
        wrvu_90th: 7500,
        tcc_per_wrvu_25th: 65,
        tcc_per_wrvu_50th: 75,
        tcc_per_wrvu_75th: 85,
        tcc_per_wrvu_90th: 95
      },
      {
        specialty: 'Family Medicine',
        tcc_25th: 220000,
        tcc_50th: 260000,
        tcc_75th: 310000,
        tcc_90th: 375000,
        wrvu_25th: 4000,
        wrvu_50th: 4800,
        wrvu_75th: 5600,
        wrvu_90th: 6500,
        tcc_per_wrvu_25th: 50,
        tcc_per_wrvu_50th: 58,
        tcc_per_wrvu_75th: 68,
        tcc_per_wrvu_90th: 80
      },
      {
        specialty: 'Internal Medicine',
        tcc_25th: 230000,
        tcc_50th: 275000,
        tcc_75th: 325000,
        tcc_90th: 390000,
        wrvu_25th: 4200,
        wrvu_50th: 5000,
        wrvu_75th: 5800,
        wrvu_90th: 6700,
        tcc_per_wrvu_25th: 52,
        tcc_per_wrvu_50th: 60,
        tcc_per_wrvu_75th: 70,
        tcc_per_wrvu_90th: 82
      }
    ];
    setMarketData(mockMarketData);
  }, []);

  useEffect(() => {
    if (providers.length && marketData.length) {
      const calculatedMetrics = providers.map(provider => {
        const marketBenchmarks = marketData.find(m => m.specialty === provider.specialty) || marketData[0];

        const tcc = provider.base_pay + provider.wrvu_incentive + provider.quality_payments + provider.admin_payments;
        const tcc_per_wrvu = provider.conversion_factor;

        // Create benchmark arrays for interpolation
        const tccBenchmarks = [
          { value: marketBenchmarks.tcc_25th, percentile: 25 },
          { value: marketBenchmarks.tcc_50th, percentile: 50 },
          { value: marketBenchmarks.tcc_75th, percentile: 75 },
          { value: marketBenchmarks.tcc_90th, percentile: 90 }
        ];

        const wrvuBenchmarks = [
          { value: marketBenchmarks.wrvu_25th, percentile: 25 },
          { value: marketBenchmarks.wrvu_50th, percentile: 50 },
          { value: marketBenchmarks.wrvu_75th, percentile: 75 },
          { value: marketBenchmarks.wrvu_90th, percentile: 90 }
        ];

        const tccPerWrvuBenchmarks = [
          { value: marketBenchmarks.tcc_per_wrvu_25th, percentile: 25 },
          { value: marketBenchmarks.tcc_per_wrvu_50th, percentile: 50 },
          { value: marketBenchmarks.tcc_per_wrvu_75th, percentile: 75 },
          { value: marketBenchmarks.tcc_per_wrvu_90th, percentile: 90 }
        ];

        // Calculate exact percentiles using linear interpolation
        const tcc_percentile = Math.round(calculateExactPercentile(tcc, tccBenchmarks));
        const wrvu_percentile = Math.round(calculateExactPercentile(provider.annual_wrvus, wrvuBenchmarks));
        const tcc_per_wrvu_percentile = Math.round(calculateExactPercentile(tcc_per_wrvu, tccPerWrvuBenchmarks));

        const risk_level = calculateRiskLevel(tcc_percentile, wrvu_percentile, tcc_per_wrvu_percentile);
        
        return {
          id: provider.employee_id,
          name: provider.full_name,
          specialty: provider.specialty,
          tcc,
          tcc_percentile,
          annual_wrvus: provider.annual_wrvus,
          wrvu_percentile,
          tcc_per_wrvu,
          tcc_per_wrvu_percentile,
          risk_level,
          status: 'Pending',
          last_review_date: null
        };
      });

      setProviderMetrics(calculatedMetrics);
      
      setMetrics({
        totalProviders: calculatedMetrics.length,
        atRiskProviders: calculatedMetrics.filter(p => p.tcc_percentile > 75).length,
        pendingReviews: calculatedMetrics.filter(p => p.status === 'Pending').length,
        completedReviews: calculatedMetrics.filter(p => p.status === 'Completed').length
      });
    }
  }, [providers, marketData]);

  const columns = [
    {
      title: 'Provider Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ProviderMetrics) => (
        <Link 
          to={`/results/${encodeURIComponent(text)}?specialty=${encodeURIComponent(record.specialty)}&id=${encodeURIComponent(record.id)}`}
          className="text-blue-600 hover:text-blue-800"
        >
          {text}
        </Link>
      ),
      sorter: (a: ProviderMetrics, b: ProviderMetrics) => a.name.localeCompare(b.name)
    },
    {
      title: 'Specialty',
      dataIndex: 'specialty',
      key: 'specialty',
      sorter: (a: ProviderMetrics, b: ProviderMetrics) => a.specialty.localeCompare(b.specialty)
    },
    {
      title: 'Total Cash Comp.',
      dataIndex: 'tcc',
      key: 'tcc',
      render: (value: number) => formatCurrency(value),
      sorter: (a: ProviderMetrics, b: ProviderMetrics) => a.tcc - b.tcc
    },
    {
      title: 'TCC %ile',
      dataIndex: 'tcc_percentile',
      key: 'tcc_percentile',
      render: (value: number) => `${value}%`,
      sorter: (a: ProviderMetrics, b: ProviderMetrics) => a.tcc_percentile - b.tcc_percentile
    },
    {
      title: 'Annual wRVUs',
      dataIndex: 'annual_wrvus',
      key: 'annual_wrvus',
      render: (value: number) => formatNumber(value),
      sorter: (a: ProviderMetrics, b: ProviderMetrics) => a.annual_wrvus - b.annual_wrvus
    },
    {
      title: 'wRVU %ile',
      dataIndex: 'wrvu_percentile',
      key: 'wrvu_percentile',
      render: (value: number) => `${value}%`,
      sorter: (a: ProviderMetrics, b: ProviderMetrics) => a.wrvu_percentile - b.wrvu_percentile
    },
    {
      title: 'TCC/wRVU',
      dataIndex: 'tcc_per_wrvu',
      key: 'tcc_per_wrvu',
      render: (value: number) => formatCurrency(value),
      sorter: (a: ProviderMetrics, b: ProviderMetrics) => a.tcc_per_wrvu - b.tcc_per_wrvu
    },
    {
      title: 'TCC/wRVU %ile',
      dataIndex: 'tcc_per_wrvu_percentile',
      key: 'tcc_per_wrvu_percentile',
      render: (value: number) => `${value}%`,
      sorter: (a: ProviderMetrics, b: ProviderMetrics) => a.tcc_per_wrvu_percentile - b.tcc_per_wrvu_percentile
    },
    {
      title: 'Risk Level',
      dataIndex: 'risk_level',
      key: 'risk_level',
      render: (value: string) => {
        const color = value === 'High' ? 'red' : value === 'Medium' ? 'orange' : 'green';
        return <Tag color={color}>{value}</Tag>;
      },
      sorter: (a: ProviderMetrics, b: ProviderMetrics) => a.risk_level.localeCompare(b.risk_level)
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (value: string) => {
        const color = value === 'Approved' ? 'green' : value === 'Rejected' ? 'red' : 'gold';
        return <Tag color={color}>{value}</Tag>;
      },
      sorter: (a: ProviderMetrics, b: ProviderMetrics) => a.status.localeCompare(b.status)
    },
    {
      title: 'Last Review',
      dataIndex: 'last_review_date',
      key: 'last_review_date',
      render: (value: string | null) => value ? new Date(value).toLocaleDateString() : 'Never',
      sorter: (a: ProviderMetrics, b: ProviderMetrics) => {
        if (!a.last_review_date && !b.last_review_date) return 0;
        if (!a.last_review_date) return 1;
        if (!b.last_review_date) return -1;
        return new Date(a.last_review_date).getTime() - new Date(b.last_review_date).getTime();
      }
    }
  ];

  const filteredProviderMetrics = providerMetrics.filter(provider => 
    provider.name.toLowerCase().includes(searchText.toLowerCase()) ||
    provider.specialty.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">FMV Review Dashboard</h1>
      
      <div className="grid grid-cols-4 gap-6">
        <Card className="shadow-sm">
          <div className="flex items-center">
            <UsergroupAddOutlined className="text-2xl text-blue-500 mr-4" />
            <div>
              <div className="text-sm text-gray-600">Total Providers</div>
              <div className="text-2xl font-semibold">{metrics.totalProviders}</div>
            </div>
          </div>
        </Card>

        <Card className="shadow-sm">
          <div className="flex items-center">
            <AlertOutlined className="text-2xl text-red-500 mr-4" />
            <div>
              <div className="text-sm text-gray-600">At Risk (&gt;75th percentile)</div>
              <div className="text-2xl font-semibold">{metrics.atRiskProviders}</div>
            </div>
          </div>
        </Card>

        <Card className="shadow-sm">
          <div className="flex items-center">
            <ClockCircleOutlined className="text-2xl text-yellow-500 mr-4" />
            <div>
              <div className="text-sm text-gray-600">Pending Reviews</div>
              <div className="text-2xl font-semibold">{metrics.pendingReviews}</div>
            </div>
          </div>
        </Card>

        <Card className="shadow-sm">
          <div className="flex items-center">
            <CheckCircleOutlined className="text-2xl text-green-500 mr-4" />
            <div>
              <div className="text-sm text-gray-600">Completed Reviews</div>
              <div className="text-2xl font-semibold">{metrics.completedReviews}</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Provider FMV Status</h2>
            <Input
              placeholder="Search providers or specialties..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 250 }}
              className="rounded-md"
            />
          </div>
          <Table
            dataSource={filteredProviderMetrics}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            bordered
            className="provider-table"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 