import React, { useRef, useState } from 'react';
import { Card } from './ui';
import { EmployeeData } from '../types';

interface EmployeeDataUploadProps {
  onDataUploaded: (data: EmployeeData[]) => void;
}

const REQUIRED_COLUMNS = [
  'employee_id',
  'full_name',
  'specialty',
  'base_pay',
  'wrvu_incentive',
  'quality_payments',
  'admin_payments',
  'conversion_factor',
  'annual_wrvus'
];

const COLUMN_ALIASES: { [key: string]: string } = {
  'employeeid': 'employee_id',
  'name': 'full_name',
  'fullname': 'full_name',
  'basepay': 'base_pay',
  'wrvuincentive': 'wrvu_incentive',
  'qualitypayments': 'quality_payments',
  'adminpayments': 'admin_payments',
  'conversionfactor': 'conversion_factor',
  'cf': 'conversion_factor',
  'annualwrvus': 'annual_wrvus',
  'wrvus': 'annual_wrvus'
};

const EmployeeDataUpload: React.FC<EmployeeDataUploadProps> = ({ onDataUploaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const normalizeHeader = (header: string | undefined | null): string => {
    if (!header) return '';
    const normalized = header.toLowerCase().trim();
    return COLUMN_ALIASES[normalized] || normalized;
  };

  const validateHeaders = (headers: string[]): string | null => {
    console.log('Raw headers:', headers);
    const normalizedHeaders = headers.map(normalizeHeader);
    console.log('Normalized headers:', normalizedHeaders);
    const missingColumns = REQUIRED_COLUMNS.filter(col => 
      !normalizedHeaders.includes(col)
    );
    console.log('Missing columns:', missingColumns);
    
    if (missingColumns.length > 0) {
      return `Missing required columns: ${missingColumns.join(', ')}`;
    }
    return null;
  };

  const validateDataTypes = (record: any): string | null => {
    // Validate string fields
    if (!record.employeeId || typeof record.employeeId !== 'string') {
      return 'Employee ID must be a non-empty string';
    }
    if (!record.fullName || typeof record.fullName !== 'string') {
      return 'Full Name must be a non-empty string';
    }
    if (!record.specialty || typeof record.specialty !== 'string') {
      return 'Specialty must be a non-empty string';
    }

    // Validate numeric fields
    const numericFields = [
      { field: 'basePay', name: 'Base Pay' },
      { field: 'wrvuIncentive', name: 'wRVU Incentive' },
      { field: 'qualityPayments', name: 'Quality Payments' },
      { field: 'adminPayments', name: 'Admin Payments' },
      { field: 'conversionFactor', name: 'Conversion Factor' },
      { field: 'annualWrvus', name: 'Annual wRVUs' }
    ];

    for (const { field, name } of numericFields) {
      const value = record[field];
      if (typeof value !== 'number' || isNaN(value)) {
        return `${name} must be a valid number`;
      }
      if (value < 0) {
        return `${name} cannot be negative`;
      }
    }

    // Validate conversion factor range
    if (record.conversionFactor < 30 || record.conversionFactor > 100) {
      return 'Conversion Factor should be between $30 and $100';
    }

    return null;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);
    setSuccess(null);
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          setError('Failed to read file contents');
          return;
        }

        console.log('Starting file processing');
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        
        if (lines.length === 0) {
          setError('File appears to be empty');
          return;
        }

        console.log('Processing file with', lines.length, 'lines');
        const headers = lines[0].split(',').map(h => h.trim());
        console.log('Found headers:', headers);

        // Validate headers
        const headerError = validateHeaders(headers);
        if (headerError) {
          setError(headerError);
          return;
        }

        const normalizedHeaders = headers.map(normalizeHeader);
        const data: EmployeeData[] = [];

        // Process each line
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          
          if (values.length !== headers.length) {
            setError(`Line ${i + 1} has incorrect number of columns (expected ${headers.length}, got ${values.length})`);
            return;
          }

          const record: any = {};
          normalizedHeaders.forEach((header, index) => {
            const value = values[index];
            if (!value && header !== 'admin_fte') { // admin_fte is optional
              setError(`Line ${i + 1} has empty value for required field: ${header}`);
              return;
            }
            
            switch (header) {
              case 'employee_id':
                record.employeeId = value;
                break;
              case 'full_name':
                record.fullName = value;
                break;
              case 'specialty':
                record.specialty = value;
                break;
              case 'base_pay':
                const basePay = parseFloat(value);
                if (isNaN(basePay)) {
                  setError(`Line ${i + 1} has invalid base pay: ${value}`);
                  return;
                }
                record.basePay = basePay;
                break;
              case 'wrvu_incentive':
                const wrvuIncentive = parseFloat(value);
                if (isNaN(wrvuIncentive)) {
                  setError(`Line ${i + 1} has invalid wRVU incentive: ${value}`);
                  return;
                }
                record.wrvuIncentive = wrvuIncentive;
                break;
              case 'quality_payments':
                const qualityPayments = parseFloat(value);
                if (isNaN(qualityPayments)) {
                  setError(`Line ${i + 1} has invalid quality payments: ${value}`);
                  return;
                }
                record.qualityPayments = qualityPayments;
                break;
              case 'admin_payments':
                const adminPayments = parseFloat(value);
                if (isNaN(adminPayments)) {
                  setError(`Line ${i + 1} has invalid admin payments: ${value}`);
                  return;
                }
                record.adminPayments = adminPayments;
                break;
              case 'conversion_factor':
                const conversionFactor = parseFloat(value);
                if (isNaN(conversionFactor)) {
                  setError(`Line ${i + 1} has invalid conversion factor: ${value}`);
                  return;
                }
                record.conversionFactor = conversionFactor;
                break;
              case 'annual_wrvus':
                const annualWrvus = parseFloat(value);
                if (isNaN(annualWrvus)) {
                  setError(`Line ${i + 1} has invalid annual wRVUs: ${value}`);
                  return;
                }
                record.annualWrvus = annualWrvus;
                break;
            }
          });

          if (error) return; // Stop processing if an error was set
          data.push(record as EmployeeData);
        }

        console.log('Successfully processed', data.length, 'records');
        onDataUploaded(data);
        setSuccess(`Successfully uploaded ${data.length} records`);
        if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Reset file input
        }
      } catch (err) {
        console.error('Error processing file:', err);
        setError(`Error processing file: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    reader.onerror = () => {
      setError('Error reading file');
    };

    reader.readAsText(file);
  };

  return (
    <Card title="Employee Data Upload">
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Upload Employee Data</h4>
          <p className="text-xs text-gray-500 mb-4">
            Upload a CSV file containing employee information with the following required columns:
            <br />
            • Employee ID (employee_id)
            <br />
            • Full Name (full_name)
            <br />
            • Specialty (specialty)
            <br />
            • Base Pay (base_pay)
            <br />
            • wRVU Incentive (wrvu_incentive)
            <br />
            • Quality Payments (quality_payments)
            <br />
            • Administrative Payments (admin_payments)
            <br />
            • Conversion Factor (conversion_factor)
            <br />
            • Annual wRVUs (annual_wrvus)
          </p>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
              {success}
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg text-xs font-mono overflow-x-auto mt-4">
            <p className="font-medium mb-2">Example Format:</p>
            employee_id,full_name,specialty,base_pay,wrvu_incentive,quality_payments,admin_payments,conversion_factor,annual_wrvus
            <br />
            EMP001,Jason Johnson,Dermatology,302024,72872,28452,4598,50,5244
            <br />
            EMP007,Allison Potter,Cardiology,316550,80149,27497,130,65.8,6842
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            <p className="font-medium">Specialty-Specific Guidelines:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <p className="font-medium">Conversion Factors:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>Dermatology: ~$50.00</li>
                  <li>Cardiology: ~$65.80</li>
                  <li>Internal Medicine: ~$47.25</li>
                  <li>General Surgery: ~$70.00</li>
                  <li>Anesthesiology: ~$60.00</li>
                  <li>Orthopedic Surgery: ~$75.50</li>
                  <li>Neurology: ~$55.00</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">Typical Annual wRVUs:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>Dermatology: 5,000-6,000</li>
                  <li>Cardiology: 6,500-7,500</li>
                  <li>Internal Medicine: 5,500-6,500</li>
                  <li>General Surgery: 7,000-8,500</li>
                  <li>Anesthesiology: 7,000-8,000</li>
                  <li>Orthopedic Surgery: 8,000-9,500</li>
                  <li>Neurology: 6,000-7,000</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Choose File
          </button>
          <span className="text-sm text-gray-500">
            {fileInputRef.current?.files?.[0]?.name || 'No file chosen'}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default EmployeeDataUpload; 