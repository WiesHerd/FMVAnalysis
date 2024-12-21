import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, Dropdown } from 'antd';
import { TeamOutlined, LineChartOutlined, UnorderedListOutlined, HomeOutlined } from '@ant-design/icons';
import FMVIcon from './FMVIcon';

const Header: React.FC = () => {
  const location = useLocation();

  // Don't show header on home page
  if (location.pathname === '/') {
    return null;
  }

  const items = [
    {
      key: 'provider-listing',
      label: (
        <Link to="/dashboard" className="block p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
              <UnorderedListOutlined className="text-blue-500 text-xl" />
            </div>
            <div>
              <div className="text-gray-900 font-medium">FMV Tracking</div>
              <div className="text-gray-500 text-sm">View and manage all providers</div>
            </div>
          </div>
        </Link>
      ),
    },
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
    <header className="bg-white shadow-sm">
      <div className="px-12">
        <div className="flex justify-between items-center py-3">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <FMVIcon className="w-6 h-6 text-blue-500" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900 m-0">Fair Market Value Review</h1>
                <p className="text-xs text-gray-500 m-0">Tracking and Managing System</p>
              </div>
            </Link>
          </div>

          <div className="flex gap-2">
            <Link to="/">
              <Button 
                type="primary"
                className="bg-blue-500"
                icon={<HomeOutlined />}
              >
                Home
              </Button>
            </Link>
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
        </div>
      </div>
    </header>
  );
};

export default Header; 