export interface EmployeeData {
  employeeId: string;
  fullName: string;
  specialty: string;
  basePay: number;
  wrvuIncentive: number;
  qualityPayments: number;
  adminPayments: number;
  annualWrvus: number;
  conversionFactor: number;
  adminFte?: number;
} 