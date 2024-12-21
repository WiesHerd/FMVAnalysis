// src/App.tsx
import 'antd/dist/reset.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Home from './pages/Home';
import ProviderSelection from './pages/ProviderSelection';
import CompensationResults from './pages/CompensationResults';
import MarketData from './pages/MarketData';
import EmployeeData from './pages/EmployeeData';
import Dashboard from './pages/Dashboard';
import Header from './components/Header';

const { Content } = Layout;

const App: React.FC = () => {
  return (
    <Router>
      <Layout className="min-h-screen">
        <Header />
        <Content className="p-6 bg-gray-50">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/provider-selection" element={<ProviderSelection />} />
            <Route path="/results/:name" element={<CompensationResults />} />
            <Route path="/market-data" element={<MarketData />} />
            <Route path="/employee-data" element={<EmployeeData />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </Content>
      </Layout>
    </Router>
  );
}

export default App;