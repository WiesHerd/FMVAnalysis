// src/App.tsx
import 'antd/dist/reset.css';
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Layout, Dropdown, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import CompensationCalculator from './pages/CompensationCalculator';
import CompensationResults from './pages/CompensationResults';
import MarketData from './pages/MarketData';
import EmployeeData from './pages/EmployeeData';

const { Header, Content } = Layout;

const App: React.FC = () => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const items = [
    {
      key: 'market-data',
      label: <Link to="/market-data">Market Data Upload</Link>
    },
    {
      key: 'employee-data',
      label: <Link to="/employee-data">Employee Data Upload</Link>
    }
  ];

  return (
    <Router>
      <Layout className="layout" style={{ minHeight: '100vh' }}>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Link to="/" style={{ 
            fontSize: '20px', 
            fontWeight: 'bold',
            color: '#1a3353',
            textDecoration: 'none'
          }}>
            FMV Analyzer
          </Link>
          <Dropdown 
            menu={{ items }}
            trigger={['click']}
            open={isDropdownVisible}
            onOpenChange={setIsDropdownVisible}
          >
            <Space style={{ 
              cursor: 'pointer',
              userSelect: 'none',
              color: '#1a3353'
            }}>
              Data Management
              <DownOutlined style={{ fontSize: '12px' }} />
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ padding: '24px', background: '#f0f2f5' }}>
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
};

export default App;