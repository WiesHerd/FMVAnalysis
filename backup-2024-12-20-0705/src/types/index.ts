// src/types/index.ts
export interface Provider {
  id: string;
  name: string;
  specialty: string;
  compensation: {
    base: number;
    wrvus: number;
    callCoverage: number;
    administrative: number;
    quality: number;
  };
}

export interface MarketData {
  specialty: string;
  year: number;
  percentiles: {
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
}

export interface EmployeeData {
  employeeId: string;
  fullName: string;
  specialty: string;
  basePay: number;
  wrvuIncentive: number;
  qualityPayments: number;
  adminPayments: number;
  conversionFactor: number;
  annualWrvus: number;
}