import React, { useState } from 'react';
import { useRiskConfig } from '../context/RiskConfigContext';
import { Card } from './ui';

interface QualificationCriteriaEditorProps {
  onClose: () => void;
}

const QualificationCriteriaEditor: React.FC<QualificationCriteriaEditorProps> = ({ onClose }) => {
  const { qualificationCriteria, updateQualificationCriteria } = useRiskConfig();
  const [editingCriteria, setEditingCriteria] = useState(qualificationCriteria);
  const [selectedCriterion, setSelectedCriterion] = useState<typeof qualificationCriteria[0] | null>(null);

  const handleAddCriterion = () => {
    const newCriterion = {
      id: `criterion_${Date.now()}`,
      name: 'New Criterion',
      type: 'range' as const,
      points: {
        ranges: [
          { min: 0, max: 5, points: 1, description: 'Level 1' },
          { min: 6, max: 10, points: 2, description: 'Level 2' }
        ]
      }
    };
    setEditingCriteria([...editingCriteria, newCriterion]);
    setSelectedCriterion(newCriterion);
  };

  const handleUpdateCriterion = (updatedCriterion: typeof qualificationCriteria[0]) => {
    const newCriteria = editingCriteria.map(c =>
      c.id === updatedCriterion.id ? updatedCriterion : c
    );
    setEditingCriteria(newCriteria);
    setSelectedCriterion(updatedCriterion);
  };

  const handleDeleteCriterion = (criterionId: string) => {
    const newCriteria = editingCriteria.filter(c => c.id !== criterionId);
    setEditingCriteria(newCriteria);
    if (selectedCriterion?.id === criterionId) {
      setSelectedCriterion(null);
    }
  };

  const handleSave = () => {
    updateQualificationCriteria(editingCriteria);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-medium text-gray-900">Edit Qualification Criteria</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-12 gap-0 h-[calc(90vh-5rem)]">
          {/* Criteria List */}
          <div className="col-span-4 border-r overflow-y-auto">
            <div className="p-4">
              <button
                onClick={handleAddCriterion}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add New Criterion
              </button>
            </div>
            <ul className="divide-y divide-gray-200">
              {editingCriteria.map(criterion => (
                <li
                  key={criterion.id}
                  className={`px-4 py-4 cursor-pointer hover:bg-gray-50 ${
                    selectedCriterion?.id === criterion.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedCriterion(criterion)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{criterion.name}</div>
                      <div className="text-sm text-gray-500">
                        {criterion.type === 'range'
                          ? `${criterion.points.ranges?.length || 0} ranges`
                          : `${criterion.points.options?.length || 0} options`}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCriterion(criterion.id);
                      }}
                      className="text-red-500 hover:text-red-600"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Criterion Editor */}
          <div className="col-span-8 overflow-y-auto">
            {selectedCriterion ? (
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={selectedCriterion.name}
                    onChange={(e) => handleUpdateCriterion({
                      ...selectedCriterion,
                      name: e.target.value
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={selectedCriterion.type}
                    onChange={(e) => handleUpdateCriterion({
                      ...selectedCriterion,
                      type: e.target.value as 'range' | 'multi-select',
                      points: e.target.value === 'range'
                        ? { ranges: [{ min: 0, max: 5, points: 1, description: 'Level 1' }] }
                        : { options: [{ value: 'option1', points: 1, description: 'Option 1' }] }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="range">Range</option>
                    <option value="multi-select">Multi-select</option>
                  </select>
                </div>

                {selectedCriterion.type === 'range' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-sm font-medium text-gray-700">Ranges</label>
                      <button
                        onClick={() => {
                          const lastRange = selectedCriterion.points.ranges?.[selectedCriterion.points.ranges.length - 1];
                          const newRange = {
                            min: (lastRange?.max || 0) + 1,
                            max: (lastRange?.max || 0) + 5,
                            points: (lastRange?.points || 0) + 1,
                            description: `Level ${(selectedCriterion.points.ranges?.length || 0) + 1}`
                          };
                          handleUpdateCriterion({
                            ...selectedCriterion,
                            points: {
                              ranges: [...(selectedCriterion.points.ranges || []), newRange]
                            }
                          });
                        }}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                      >
                        Add Range
                      </button>
                    </div>
                    <div className="space-y-4">
                      {selectedCriterion.points.ranges?.map((range, index) => (
                        <div key={index} className="grid grid-cols-5 gap-4 items-end">
                          <div>
                            <label className="block text-xs text-gray-500">Min</label>
                            <input
                              type="number"
                              value={range.min}
                              onChange={(e) => {
                                const newRanges = [...(selectedCriterion.points.ranges || [])];
                                newRanges[index] = { ...range, min: Number(e.target.value) };
                                handleUpdateCriterion({
                                  ...selectedCriterion,
                                  points: { ranges: newRanges }
                                });
                              }}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500">Max</label>
                            <input
                              type="number"
                              value={range.max}
                              onChange={(e) => {
                                const newRanges = [...(selectedCriterion.points.ranges || [])];
                                newRanges[index] = { ...range, max: Number(e.target.value) };
                                handleUpdateCriterion({
                                  ...selectedCriterion,
                                  points: { ranges: newRanges }
                                });
                              }}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500">Points</label>
                            <input
                              type="number"
                              value={range.points}
                              onChange={(e) => {
                                const newRanges = [...(selectedCriterion.points.ranges || [])];
                                newRanges[index] = { ...range, points: Number(e.target.value) };
                                handleUpdateCriterion({
                                  ...selectedCriterion,
                                  points: { ranges: newRanges }
                                });
                              }}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs text-gray-500">Description</label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={range.description}
                                onChange={(e) => {
                                  const newRanges = [...(selectedCriterion.points.ranges || [])];
                                  newRanges[index] = { ...range, description: e.target.value };
                                  handleUpdateCriterion({
                                    ...selectedCriterion,
                                    points: { ranges: newRanges }
                                  });
                                }}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              />
                              <button
                                onClick={() => {
                                  const newRanges = selectedCriterion.points.ranges?.filter((_, i) => i !== index);
                                  handleUpdateCriterion({
                                    ...selectedCriterion,
                                    points: { ranges: newRanges }
                                  });
                                }}
                                className="text-red-500 hover:text-red-600"
                              >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCriterion.type === 'multi-select' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-sm font-medium text-gray-700">Options</label>
                      <button
                        onClick={() => {
                          const newOption = {
                            value: `option${(selectedCriterion.points.options?.length || 0) + 1}`,
                            points: 1,
                            description: `Option ${(selectedCriterion.points.options?.length || 0) + 1}`
                          };
                          handleUpdateCriterion({
                            ...selectedCriterion,
                            points: {
                              options: [...(selectedCriterion.points.options || []), newOption]
                            }
                          });
                        }}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                      >
                        Add Option
                      </button>
                    </div>
                    <div className="space-y-4">
                      {selectedCriterion.points.options?.map((option, index) => (
                        <div key={index} className="grid grid-cols-4 gap-4 items-end">
                          <div>
                            <label className="block text-xs text-gray-500">Value</label>
                            <input
                              type="text"
                              value={option.value}
                              onChange={(e) => {
                                const newOptions = [...(selectedCriterion.points.options || [])];
                                newOptions[index] = { ...option, value: e.target.value };
                                handleUpdateCriterion({
                                  ...selectedCriterion,
                                  points: { options: newOptions }
                                });
                              }}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500">Points</label>
                            <input
                              type="number"
                              value={option.points}
                              onChange={(e) => {
                                const newOptions = [...(selectedCriterion.points.options || [])];
                                newOptions[index] = { ...option, points: Number(e.target.value) };
                                handleUpdateCriterion({
                                  ...selectedCriterion,
                                  points: { options: newOptions }
                                });
                              }}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs text-gray-500">Description</label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={option.description}
                                onChange={(e) => {
                                  const newOptions = [...(selectedCriterion.points.options || [])];
                                  newOptions[index] = { ...option, description: e.target.value };
                                  handleUpdateCriterion({
                                    ...selectedCriterion,
                                    points: { options: newOptions }
                                  });
                                }}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              />
                              <button
                                onClick={() => {
                                  const newOptions = selectedCriterion.points.options?.filter((_, i) => i !== index);
                                  handleUpdateCriterion({
                                    ...selectedCriterion,
                                    points: { options: newOptions }
                                  });
                                }}
                                className="text-red-500 hover:text-red-600"
                              >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Select a criterion to edit or create a new one
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default QualificationCriteriaEditor; 