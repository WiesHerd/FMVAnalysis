import React from 'react';
import { RiskModalProps } from '../types/risk';

export const RiskModal: React.FC<RiskModalProps> = ({ isOpen, onClose, factor, onSave }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4">{factor.category}</h2>
        <p className="mb-4">{factor.description}</p>
        
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Risk Score</h3>
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((score) => (
              <button
                key={score}
                onClick={() => onSave(score as 0 | 1 | 2 | 3, factor.findings, factor.recommendations)}
                className={`px-4 py-2 rounded ${
                  factor.score === score
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {score}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(factor.score, factor.findings, factor.recommendations)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiskModal; 