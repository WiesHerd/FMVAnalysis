import { Select } from './ui/Select';

interface ProviderSelectProps {
  onSpecialtyChange: (specialty: string) => void;
  onProviderChange: (providerId: string) => void;
}

const ProviderSelect = ({ onSpecialtyChange, onProviderChange }: ProviderSelectProps) => {
  // Example specialty options - you can replace with your actual data
  const specialtyOptions = [
    { value: '', label: 'Select Specialty' },
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'orthopedics', label: 'Orthopedics' },
    { value: 'pediatrics', label: 'Pediatrics' },
  ];

  // Example provider options - you can replace with your actual data
  const providerOptions = [
    { value: '', label: 'Select Provider' },
    { value: '1', label: 'Dr. Smith' },
    { value: '2', label: 'Dr. Johnson' },
    { value: '3', label: 'Dr. Williams' },
  ];

  return (
    <div className="space-y-4">
      <Select
        label="Specialty"
        options={specialtyOptions}
        onChange={(e) => onSpecialtyChange(e.target.value)}
      />
      <Select
        label="Provider"
        options={providerOptions}
        onChange={(e) => onProviderChange(e.target.value)}
      />
    </div>
  );
};

export default ProviderSelect;