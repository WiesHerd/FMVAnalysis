import React, { useRef, useState } from 'react';
import { Button } from 'antd';
import { UploadOutlined, PrinterOutlined } from '@ant-design/icons';

interface EmployeeDataUploadProps {
  onDataUploaded: (data: any[]) => void;
}

const EmployeeDataUpload: React.FC<EmployeeDataUploadProps> = ({ onDataUploaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadedRecords, setLoadedRecords] = useState<number | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.name.toLowerCase().endsWith('.csv')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) return;

        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        if (lines.length === 0) return;

        const headers = lines[0].split(',').map(h => h.trim());
        const data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          const record: any = {};
          headers.forEach((header, index) => {
            record[header] = values[index];
          });
          return record;
        });

        onDataUploaded(data);
        setLoadedRecords(data.length);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (err) {
        console.error('Error processing file:', err);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="px-6 py-4 bg-white">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-medium text-gray-900">Provider Data Management</h1>
        <div className="flex gap-4">
          <Button
            icon={<UploadOutlined />}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center"
          >
            Upload Provider Data
          </Button>
          <Button
            icon={<PrinterOutlined />}
            className="flex items-center"
          >
            Print Provider Data
          </Button>
        </div>
      </div>

      {loadedRecords !== null && (
        <div className="mt-4">
          <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-md text-sm inline-flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            Loaded {loadedRecords} records from storage
          </div>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv"
        className="hidden"
      />
    </div>
  );
};

export default EmployeeDataUpload; 