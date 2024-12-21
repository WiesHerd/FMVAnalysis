import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserOutlined, UploadOutlined, LineChartOutlined, UnorderedListOutlined } from '@ant-design/icons';
import FMVIcon from '../components/FMVIcon';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Select Provider',
      description: 'Choose a provider to analyze their compensation',
      icon: <UserOutlined className="text-blue-600 text-3xl" />,
      path: '/provider-selection'
    },
    {
      title: 'Upload Provider',
      description: 'Import new provider data into the system',
      icon: <UploadOutlined className="text-blue-600 text-3xl" />,
      path: '/employee-data'
    },
    {
      title: 'Upload Market',
      description: 'Update market data and benchmarks',
      icon: <LineChartOutlined className="text-blue-600 text-3xl" />,
      path: '/market-data'
    },
    {
      title: 'FMV Tracking',
      description: 'View and manage all providers',
      icon: <UnorderedListOutlined className="text-blue-600 text-3xl" />,
      path: '/dashboard'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-2">
            <FMVIcon className="w-12 h-12 text-blue-600" />
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">
                Fair Market Value Review
              </h1>
              <p className="text-lg text-gray-600">
                Tracking and Managing System
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {cards.map((card, index) => (
            <div
              key={index}
              onClick={() => navigate(card.path)}
              className="bg-white rounded-lg p-8 cursor-pointer transition-all duration-200 hover:shadow-lg border border-gray-200 hover:border-blue-200 group"
            >
              <div className="bg-blue-50 w-14 h-14 rounded-lg flex items-center justify-center mb-5 group-hover:bg-blue-100 transition-colors">
                {card.icon}
              </div>
              <h2 className="text-xl font-medium text-gray-900 mb-2">
                {card.title}
              </h2>
              <p className="text-gray-600">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home; 