// src/App.tsx
import 'antd/dist/reset.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Layout, Button, Dropdown } from 'antd';
import { TeamOutlined, LineChartOutlined } from '@ant-design/icons';
import CompensationCalculator from './pages/CompensationCalculator';
import CompensationResults from './pages/CompensationResults';
import MarketData from './pages/MarketData';
import EmployeeData from './pages/EmployeeData';
import FMVIcon from './components/FMVIcon';

const { Header, Content } = Layout;

const App: React.FC = () => {
  const items = [
    {
      key: 'provider-data',
      label: (
        <Link to="/employee-data" className="block p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
              <TeamOutlined className="text-blue-500 text-xl" />
            </div>
            <div>
              <div className="text-gray-900 font-medium">Provider Data</div>
              <div className="text-gray-500 text-sm">Manage provider information</div>
            </div>
          </div>
        </Link>
      ),
    },
    {
      key: 'market-data',
      label: (
        <Link to="/market-data" className="block p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
              <LineChartOutlined className="text-blue-500 text-xl" />
            </div>
            <div>
              <div className="text-gray-900 font-medium">Market Data</div>
              <div className="text-gray-500 text-sm">Update compensation benchmarks</div>
            </div>
          </div>
        </Link>
      ),
    }
  ];

  return (
    <Router>
      <Layout className="min-h-screen">
        <Header className="bg-white px-6 flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <FMVIcon className="w-6 h-6 text-blue-500" />
            <div>
              <h1 className="text-lg font-medium text-gray-900 m-0">Fair Market Value Review</h1>
              <p className="text-xs text-gray-500 m-0">Tracking and Managing System</p>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            <Dropdown 
              menu={{ items }} 
              placement="bottomRight"
              trigger={['click']}
              overlayStyle={{ 
                width: '320px',
                padding: '8px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
            >
              <Button
                type="primary"
                className="bg-blue-500"
              >
                Data Management
              </Button>
            </Dropdown>
          </div>
        </Header>
        
        <Content className="p-6 bg-gray-50">
          <Routes>
            <Route path="/" element={<CompensationCalculator />} />
            <Route path="/results" element={<CompensationResults />} />
            <Route path="/market-data" element={<MarketData />} />
            <Route path="/employee-data" element={<EmployeeData />} />
          </Routes>
        </Content>
      </Layout>
    </Router>
  );
}

export default App;