import React from 'react';
import { RiskModalProps } from '../types/risk';

export const RiskModal: React.FC<RiskModalProps> = ({ isOpen, onClose, factor, onSave }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">{factor.category}</h2>
        <p className="mb-4">{factor.description}</p>
        
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Risk Score</h3>
          <div className="grid grid-cols-2 gap-2">
            {[0, 1, 2, 3].map((score) => (
              <button
                key={score}
                onClick={() => onSave(score as 0 | 1 | 2 | 3, factor.findings, factor.recommendations)}
                className={`p-2 rounded flex items-center justify-between ${
                  factor.score === score
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <span className="text-sm font-medium">Score: {score}</span>
                <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center">
                  {factor.score === score && <div className="w-2 h-2 rounded-full bg-current" />}
                </div>
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