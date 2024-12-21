import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Input, Select, Slider, Space, Switch } from 'antd';
import { Link } from 'react-router-dom';
import { UsergroupAddOutlined, AlertOutlined, CheckCircleOutlined, ClockCircleOutlined, SearchOutlined, WarningOutlined, FilterOutlined } from '@ant-design/icons';
import '../styles/ProviderTable.css';
import { formatCurrency, formatNumber } from '../utils/formatters';

interface MarketData {
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

interface ReviewData {
  provider_id: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  review_date: string | null;
  reviewer: string;
  comments: string;
  risk_level: string;
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
  productivity_gap: number;
  risk_level: 'Low' | 'Medium' | 'High';
  total_risk_score: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  last_review_date: string | null;
  has_benchmarks: boolean;
}

interface DashboardMetrics {
  totalProviders: number;
  highRiskProviders: number;
  pendingReviews: number;
  completedReviews: number;
  missingBenchmarksCount: number;
}

const Dashboard: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [providerMetrics, setProviderMetrics] = useState<ProviderMetrics[]>([]);
  const [searchText, setSearchText] = useState('');
  const [showMissingBenchmarksOnly, setShowMissingBenchmarksOnly] = useState(false);
  const [providersWithoutMarketData, setProvidersWithoutMarketData] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalProviders: 0,
    highRiskProviders: 0,
    pendingReviews: 0,
    completedReviews: 0,
    missingBenchmarksCount: 0
  });

  // Update filters state to include specialty and missing benchmarks
  const [filters, setFilters] = useState({
    tccRange: [0, 100],
    wrvuRange: [0, 100],
    riskLevels: [] as string[],
    statuses: [] as string[],
    specialties: [] as string[],
    showMissingBenchmarks: false
  });
  const [showFilters, setShowFilters] = useState(false);

  // Load review data from localStorage
  const loadReviewData = (): { [key: string]: ReviewData } => {
    const savedReviews = localStorage.getItem('providerReviews');
    return savedReviews ? JSON.parse(savedReviews) : {};
  };

  // Calculate exact percentile using linear interpolation
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

  const calculateRiskScore = (tccPercentile: number, wrvuPercentile: number, tccPerWrvuPercentile: number): number => {
    let score = 0;
    // TCC percentile risk
    if (tccPercentile > 90) score += 3;
    else if (tccPercentile > 75) score += 2;
    else if (tccPercentile > 50) score += 1;

    // wRVU percentile risk (inverse - lower is riskier)
    if (wrvuPercentile < 25) score += 3;
    else if (wrvuPercentile < 50) score += 2;
    else if (wrvuPercentile < 75) score += 1;

    // TCC per wRVU percentile risk
    if (tccPerWrvuPercentile > 90) score += 3;
    else if (tccPerWrvuPercentile > 75) score += 2;
    else if (tccPerWrvuPercentile > 50) score += 1;

    return score;
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

    // Load market data from localStorage
    const savedMarketData = localStorage.getItem('marketData');
    if (savedMarketData) {
      try {
        const parsedMarketData = JSON.parse(savedMarketData);
        setMarketData(parsedMarketData);
      } catch (err) {
        console.error('Error loading market data:', err);
      }
    }
  }, []);

  useEffect(() => {
    if (providers.length > 0 && marketData.length > 0) {
      const reviewData = loadReviewData();
      const missingProviders: string[] = [];
      
      const calculatedMetrics: ProviderMetrics[] = providers
        .map(provider => {
          const marketBenchmarks = marketData.find(m => m.specialty.toLowerCase() === provider.specialty.toLowerCase());
          const hasBenchmarks = !!marketBenchmarks;

          if (!hasBenchmarks) {
            missingProviders.push(`${provider.full_name} (${provider.specialty})`);
          }

          const tcc = provider.base_pay + provider.wrvu_incentive + provider.quality_payments + provider.admin_payments;
          const tcc_per_wrvu = provider.annual_wrvus > 0 ? tcc / provider.annual_wrvus : 0;

          let tcc_percentile = 0;
          let wrvu_percentile = 0;
          let tcc_per_wrvu_percentile = 0;
          let productivity_gap = 0;
          let risk_level: 'Low' | 'Medium' | 'High' = 'Low';
          let total_risk_score = 0;

          if (hasBenchmarks) {
            const tccBenchmarks = [
              { value: marketBenchmarks.total_25th, percentile: 25 },
              { value: marketBenchmarks.total_50th, percentile: 50 },
              { value: marketBenchmarks.total_75th, percentile: 75 },
              { value: marketBenchmarks.total_90th, percentile: 90 }
            ];

            const wrvuBenchmarks = [
              { value: marketBenchmarks.wrvus_25th, percentile: 25 },
              { value: marketBenchmarks.wrvus_50th, percentile: 50 },
              { value: marketBenchmarks.wrvus_75th, percentile: 75 },
              { value: marketBenchmarks.wrvus_90th, percentile: 90 }
            ];

            const cfBenchmarks = [
              { value: marketBenchmarks.cf_25th, percentile: 25 },
              { value: marketBenchmarks.cf_50th, percentile: 50 },
              { value: marketBenchmarks.cf_75th, percentile: 75 },
              { value: marketBenchmarks.cf_90th, percentile: 90 }
            ];

            tcc_percentile = Math.round(calculateExactPercentile(tcc, tccBenchmarks));
            wrvu_percentile = Math.round(calculateExactPercentile(provider.annual_wrvus, wrvuBenchmarks));
            tcc_per_wrvu_percentile = Math.round(calculateExactPercentile(provider.conversion_factor, cfBenchmarks));
            productivity_gap = wrvu_percentile - tcc_percentile;
            total_risk_score = calculateRiskScore(tcc_percentile, wrvu_percentile, tcc_per_wrvu_percentile);
            risk_level = calculateRiskLevel(tcc_percentile, wrvu_percentile, tcc_per_wrvu_percentile) as 'Low' | 'Medium' | 'High';
          }
          
          const review = reviewData[provider.employee_id];

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
            productivity_gap,
            risk_level,
            total_risk_score,
            status: (review?.status || 'Pending') as 'Pending' | 'Approved' | 'Rejected',
            last_review_date: review?.review_date || null,
            has_benchmarks: hasBenchmarks
          };
        });

      setProvidersWithoutMarketData(missingProviders);
      setProviderMetrics(calculatedMetrics);
      
      // Update metrics
      setMetrics({
        totalProviders: calculatedMetrics.length,
        highRiskProviders: calculatedMetrics.filter(p => p.has_benchmarks && p.risk_level === 'High').length,
        pendingReviews: calculatedMetrics.filter(p => p.has_benchmarks && p.status === 'Pending').length,
        completedReviews: calculatedMetrics.filter(p => p.has_benchmarks && (p.status === 'Approved' || p.status === 'Rejected')).length,
        missingBenchmarksCount: missingProviders.length
      });
    }
  }, [providers, marketData]);

  const columns = [
    {
      title: 'Provider Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ProviderMetrics) => (
        <div>
          <Link 
            to={`/results/${encodeURIComponent(text)}?specialty=${encodeURIComponent(record.specialty)}&id=${encodeURIComponent(record.id)}`}
            className="text-blue-600 hover:text-blue-800"
          >
            {text}
          </Link>
          {!record.has_benchmarks && (
            <Tag color="red" className="ml-2">
              No Benchmarks
            </Tag>
          )}
        </div>
      ),
      sorter: (a: ProviderMetrics, b: ProviderMetrics) => a.name.localeCompare(b.name)
    },
    {
      title: 'Specialty',
      dataIndex: 'specialty',
      key: 'specialty',
      render: (text: string, record: ProviderMetrics) => (
        <div>
          {text}
          {!record.has_benchmarks && (
            <div className="text-xs text-red-500 mt-1">
              Missing benchmarks
            </div>
          )}
        </div>
      ),
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
      title: 'Productivity Gap',
      dataIndex: 'productivity_gap',
      key: 'productivity_gap',
      render: (value: number) => {
        const color = value < -10 ? 'red' : value > 10 ? 'green' : 'default';
        return <Tag color={color}>{value > 0 ? `+${value}` : value} pts</Tag>;
      },
      sorter: (a: ProviderMetrics, b: ProviderMetrics) => a.productivity_gap - b.productivity_gap
    },
    {
      title: 'Risk Score',
      dataIndex: 'total_risk_score',
      key: 'total_risk_score',
      render: (value: number) => {
        const color = value >= 6 ? 'red' : value >= 3 ? 'orange' : 'green';
        return <Tag color={color}>{value} pts</Tag>;
      },
      sorter: (a: ProviderMetrics, b: ProviderMetrics) => a.total_risk_score - b.total_risk_score
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

  const filteredProviderMetrics = providerMetrics.filter(provider => {
    // Text search filter
    const matchesSearch = provider.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         provider.specialty.toLowerCase().includes(searchText.toLowerCase());
    
    // TCC percentile range filter
    const matchesTccRange = provider.tcc_percentile >= filters.tccRange[0] && 
                           provider.tcc_percentile <= filters.tccRange[1];

    // wRVU percentile range filter
    const matchesWrvuRange = provider.wrvu_percentile >= filters.wrvuRange[0] && 
                            provider.wrvu_percentile <= filters.wrvuRange[1];

    // Risk level filter
    const matchesRiskLevel = filters.riskLevels.length === 0 || 
                            filters.riskLevels.includes(provider.risk_level);

    // Status filter
    const matchesStatus = filters.statuses.length === 0 || 
                         filters.statuses.includes(provider.status);

    // Specialty filter
    const matchesSpecialty = filters.specialties.length === 0 ||
                            filters.specialties.includes(provider.specialty);

    // Missing benchmarks filter
    const matchesMissingBenchmarks = !filters.showMissingBenchmarks || !provider.has_benchmarks;

    return matchesSearch && matchesTccRange && matchesWrvuRange && 
           matchesRiskLevel && matchesStatus && matchesSpecialty && matchesMissingBenchmarks;
  });

  // Get unique specialties for the filter dropdown
  const uniqueSpecialties = [...new Set(providerMetrics.map(p => p.specialty))].sort();

  return (
    <div className="px-12 py-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <UsergroupAddOutlined className="text-blue-500 text-xl" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Providers</div>
              <div className="text-2xl font-semibold">{metrics.totalProviders}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-red-50 p-3 rounded-lg">
              <AlertOutlined className="text-red-500 text-xl" />
            </div>
            <div>
              <div className="text-sm text-gray-500">High Risk</div>
              <div className="text-2xl font-semibold">{metrics.highRiskProviders}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-50 p-3 rounded-lg">
              <ClockCircleOutlined className="text-yellow-500 text-xl" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Pending Reviews</div>
              <div className="text-2xl font-semibold">{metrics.pendingReviews}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <CheckCircleOutlined className="text-green-500 text-xl" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Completed Reviews</div>
              <div className="text-2xl font-semibold">{metrics.completedReviews}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Provider Status Section */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Provider FMV Status</h2>
              <p className="text-sm text-gray-500">Review and manage provider compensation analysis</p>
            </div>
            <div className="flex gap-4 items-center">
              <Button 
                icon={<FilterOutlined />}
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'border-blue-500 text-blue-500' : ''}
              >
                Filters {(filters.specialties.length > 0 || 
                         filters.riskLevels.length > 0 || 
                         filters.statuses.length > 0 ||
                         filters.showMissingBenchmarks ||
                         filters.tccRange[0] !== 0 ||
                         filters.tccRange[1] !== 100 ||
                         filters.wrvuRange[0] !== 0 ||
                         filters.wrvuRange[1] !== 100) ? '(Active)' : ''}
              </Button>
              <Input
                placeholder="Search providers or specialties..."
                prefix={<SearchOutlined className="text-gray-400" />}
                style={{ width: 300 }}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="rounded-md"
              />
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <Space direction="vertical" className="w-full" size="middle">
                <div>
                  <div className="text-sm font-medium mb-2">TCC Percentile Range</div>
                  <Slider
                    range
                    value={filters.tccRange}
                    onChange={value => setFilters(prev => ({ ...prev, tccRange: value }))}
                    marks={{ 0: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%' }}
                  />
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">wRVU Percentile Range</div>
                  <Slider
                    range
                    value={filters.wrvuRange}
                    onChange={value => setFilters(prev => ({ ...prev, wrvuRange: value }))}
                    marks={{ 0: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%' }}
                  />
                </div>
                <Space wrap>
                  <div>
                    <div className="text-sm font-medium mb-2">Specialty</div>
                    <Select
                      mode="multiple"
                      placeholder="Select specialties"
                      value={filters.specialties}
                      onChange={value => setFilters(prev => ({ ...prev, specialties: value }))}
                      style={{ width: 300 }}
                      options={uniqueSpecialties.map(specialty => ({
                        label: specialty,
                        value: specialty
                      }))}
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2">Risk Level</div>
                    <Select
                      mode="multiple"
                      placeholder="Select risk levels"
                      value={filters.riskLevels}
                      onChange={value => setFilters(prev => ({ ...prev, riskLevels: value }))}
                      style={{ width: 200 }}
                      options={[
                        { label: 'Low', value: 'Low' },
                        { label: 'Medium', value: 'Medium' },
                        { label: 'High', value: 'High' }
                      ]}
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2">Status</div>
                    <Select
                      mode="multiple"
                      placeholder="Select statuses"
                      value={filters.statuses}
                      onChange={value => setFilters(prev => ({ ...prev, statuses: value }))}
                      style={{ width: 200 }}
                      options={[
                        { label: 'Pending', value: 'Pending' },
                        { label: 'Approved', value: 'Approved' },
                        { label: 'Rejected', value: 'Rejected' }
                      ]}
                    />
                  </div>
                </Space>
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={filters.showMissingBenchmarks}
                      onChange={checked => setFilters(prev => ({ ...prev, showMissingBenchmarks: checked }))}
                    />
                    <span className="text-sm">Show Missing Benchmarks Only ({metrics.missingBenchmarksCount})</span>
                  </div>
                  <Button 
                    onClick={() => setFilters({
                      tccRange: [0, 100],
                      wrvuRange: [0, 100],
                      riskLevels: [],
                      statuses: [],
                      specialties: [],
                      showMissingBenchmarks: false
                    })}
                  >
                    Reset Filters
                  </Button>
                </div>
              </Space>
            </div>
          )}

          <Table
            columns={columns}
            dataSource={filteredProviderMetrics}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            className="provider-table"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 