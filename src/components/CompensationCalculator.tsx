import React, { useState } from 'react';
import { Card, Form, Input, InputNumber, Button, Select } from 'antd';
import { useNavigate } from 'react-router-dom';

interface CompensationComponent {
  id: string;
  name: string;
  amount: number;
  type: string;
  wrvus?: number;
}

const CompensationCalculator: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [components, setComponents] = useState<CompensationComponent[]>([
    { id: 'base', name: 'Base Pay', amount: 0, type: 'base' },
    { id: 'wrvu', name: 'wRVU Incentive', amount: 0, type: 'incentive', wrvus: 0 },
    { id: 'quality', name: 'Quality Payments', amount: 0, type: 'quality' },
    { id: 'admin', name: 'Administrative Payments', amount: 0, type: 'admin' }
  ]);

  const handleAddComponent = () => {
    const newComponent = {
      id: `custom-${Date.now()}`,
      name: 'New Component',
      amount: 0,
      type: 'custom'
    };
    setComponents([...components, newComponent]);
  };

  const handleRemoveComponent = (id: string) => {
    setComponents(components.filter(c => c.id !== id));
  };

  const handleComponentChange = (id: string, updates: Partial<CompensationComponent>) => {
    setComponents(components.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));
  };

  const handleCalculate = () => {
    form.validateFields().then(values => {
      const provider = {
        name: values.providerName,
        specialty: values.specialty
      };

      const compensation = components.reduce((acc, component) => ({
        total: acc.total + (component.amount || 0),
        wrvus: acc.wrvus + (component.wrvus || 0),
        components: {
          ...acc.components,
          [component.type]: (acc.components[component.type] || 0) + (component.amount || 0)
        }
      }), {
        total: 0,
        wrvus: 0,
        components: {}
      });

      navigate('/results', { 
        state: { 
          provider,
          compensation: {
            ...compensation,
            perWrvu: compensation.wrvus ? compensation.total / compensation.wrvus : 0
          }
        }
      });
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card title="Provider FMV Calculator" className="mb-6">
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              name="specialty"
              label="Select Specialty"
              rules={[{ required: true, message: 'Please select a specialty' }]}
            >
              <Select
                showSearch
                placeholder="Select a specialty"
                optionFilterProp="children"
              >
                {/* Add your specialty options here */}
              </Select>
            </Form.Item>

            <Form.Item
              name="providerName"
              label="Provider Name"
              rules={[{ required: true, message: 'Please enter provider name' }]}
            >
              <Input placeholder="Enter provider name" />
            </Form.Item>
          </div>
        </Form>
      </Card>

      <Card 
        title="Compensation Components" 
        extra={
          <Button type="primary" onClick={handleAddComponent}>
            Add Component
          </Button>
        }
      >
        <div className="space-y-6">
          {components.map(component => (
            <div key={component.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <Input
                  value={component.name}
                  onChange={e => handleComponentChange(component.id, { name: e.target.value })}
                  className="w-64"
                  placeholder="Component Name"
                />
                {component.id !== 'base' && (
                  <Button 
                    danger 
                    onClick={() => handleRemoveComponent(component.id)}
                  >
                    Remove
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <InputNumber
                    value={component.amount}
                    onChange={value => handleComponentChange(component.id, { amount: value || 0 })}
                    formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                    className="w-full"
                  />
                </div>

                {component.id === 'wrvu' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Annual wRVUs
                    </label>
                    <InputNumber
                      value={component.wrvus}
                      onChange={value => handleComponentChange(component.id, { wrvus: value || 0 })}
                      className="w-full"
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          <div className="flex justify-end mt-6">
            <Button type="primary" size="large" onClick={handleCalculate}>
              Calculate Compensation
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CompensationCalculator; 