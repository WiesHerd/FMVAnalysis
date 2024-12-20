import React, { createContext, useContext } from 'react';
import { RiskFactor, RiskScore, RiskFactorContext as RiskFactorContextType } from '../types/risk';

export const RiskFactorContext = createContext<RiskFactorContextType>({
  factors: [],
  selectedFactor: null,
  setSelectedFactor: () => {},
  handleFactorUpdate: () => {}
});

export const useRiskFactor = () => {
  const context = useContext(RiskFactorContext);
  if (!context) {
    throw new Error('useRiskFactor must be used within a RiskFactorProvider');
  }
  return context;
}; 