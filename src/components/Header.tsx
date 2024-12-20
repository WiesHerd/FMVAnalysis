import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import FMVIcon from './FMVIcon';
import '../styles/FMVIcon.css';

const Header: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <FMVIcon className="header-icon" />
            <div className="flex flex-col">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                Fair Market Value Review
              </h1>
              <p className="text-sm text-gray-500">
                Tracking and Managing System
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <Link 
              to="/" 
              className={`flex items-center text-lg ${
                isActive('/') 
                  ? 'text-blue-600 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-7 h-7 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Select Provider
            </Link>

            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center px-6 py-2.5 rounded-lg text-lg ${
                  isActive('/provider-data') || isActive('/market-data')
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                <svg className="w-7 h-7 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                Data Management
                <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <Link
                    to="/provider-data"
                    className={`flex items-center px-4 py-3 hover:bg-gray-50 border-b border-gray-100 ${
                      isActive('/provider-data') ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div>
                      <div className={`font-medium ${isActive('/provider-data') ? 'text-blue-600' : 'text-gray-900'}`}>
                        Provider Data
                      </div>
                      <div className="text-sm text-gray-500">Manage provider information</div>
                    </div>
                  </Link>
                  <Link
                    to="/market-data"
                    className={`flex items-center px-4 py-3 hover:bg-gray-50 ${
                      isActive('/market-data') ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div>
                      <div className={`font-medium ${isActive('/market-data') ? 'text-blue-600' : 'text-gray-900'}`}>
                        Market Data
                      </div>
                      <div className="text-sm text-gray-500">Update compensation benchmarks</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 