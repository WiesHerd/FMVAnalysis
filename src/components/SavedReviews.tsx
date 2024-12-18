import React, { useState, useMemo } from 'react';
import { useRiskConfig } from '../context/RiskConfigContext';
import { Card } from './ui';

interface SavedReviewsProps {
  onReviewSelect: (reviewId: string) => void;
}

const SavedReviews: React.FC<SavedReviewsProps> = ({ onReviewSelect }) => {
  const { savedReviews } = useRiskConfig();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'completed' | 'archived'>('all');

  const filteredReviews = useMemo(() => {
    return savedReviews.filter(review => {
      const matchesSearch = 
        review.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.specialty.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || review.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [savedReviews, searchTerm, filterStatus]);

  const reviewsByStatus = useMemo(() => {
    return {
      draft: savedReviews.filter(r => r.status === 'draft').length,
      completed: savedReviews.filter(r => r.status === 'completed').length,
      archived: savedReviews.filter(r => r.status === 'archived').length
    };
  }, [savedReviews]);

  return (
    <Card>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Saved FMV Reviews</h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-64 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <div className="absolute inset-y-0 right-3 flex items-center">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex space-x-4">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              filterStatus === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All ({savedReviews.length})
          </button>
          <button
            onClick={() => setFilterStatus('draft')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              filterStatus === 'draft'
                ? 'bg-yellow-100 text-yellow-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Drafts ({reviewsByStatus.draft})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              filterStatus === 'completed'
                ? 'bg-green-100 text-green-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Completed ({reviewsByStatus.completed})
          </button>
          <button
            onClick={() => setFilterStatus('archived')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              filterStatus === 'archived'
                ? 'bg-gray-100 text-gray-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Archived ({reviewsByStatus.archived})
          </button>
        </div>

        {/* Reviews List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredReviews.map(review => (
              <li key={review.providerId}>
                <div
                  className="px-4 py-4 flex items-center sm:px-6 hover:bg-gray-50 cursor-pointer"
                  onClick={() => onReviewSelect(review.providerId)}
                >
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <div className="flex text-sm">
                        <p className="font-medium text-blue-600 truncate">{review.providerName}</p>
                        <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                          in {review.specialty}
                        </p>
                      </div>
                      <div className="mt-2 flex">
                        <div className="flex items-center text-sm text-gray-500">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p>
                            Last modified{' '}
                            {new Date(review.lastModified).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="ml-6 flex items-center text-sm text-gray-500">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p>
                            Qualification Score: {review.qualificationScores.totalPoints} points
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                      <div className="flex -space-x-1 overflow-hidden">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${review.status === 'completed' ? 'bg-green-100 text-green-800' :
                              review.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'}`}
                        >
                          {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-5 flex-shrink-0">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Empty State */}
        {filteredReviews.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v2M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-1m-1 4l-3 3m0 0l-3-3m3 3v-6" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? `No reviews match "${searchTerm}"`
                : filterStatus === 'all'
                ? 'Get started by creating a new FMV review'
                : `No ${filterStatus} reviews found`}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SavedReviews; 