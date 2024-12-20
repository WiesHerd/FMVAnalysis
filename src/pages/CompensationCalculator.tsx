import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Select, Button, Input, Form, Tooltip, Modal, Typography, Popconfirm } from 'antd';
import { PlusOutlined, InfoCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

interface Provider {
  full_name: string;
  specialty: string;
  base_pay: number;
  wrvu_incentive: number;
  quality_payments: number;
  admin_payments: number;
  annual_wrvus: number;
  conversion_factor: number;
}

interface CompensationComponent {
  id: string;
  type: 'base' | 'wrvu' | 'quality' | 'admin' | 'custom';
  name: string;
  description: string;
  amount: number;
  fte: number;
  wrvus?: number;
  conversion_factor?: number;
}

const { Text } = Typography;

const defaultDescriptions = {
  base: "Base salary represents the fixed annual compensation provided to the provider regardless of productivity or performance metrics.",
  wrvu: "Work Relative Value Units (wRVUs) incentive is a productivity-based payment calculated from the provider's clinical work output.",
  quality: "Quality payments are incentives based on meeting or exceeding specific quality metrics and patient care standards.",
  admin: "Administrative payments compensate for non-clinical duties such as leadership roles or committee participation.",
  custom: "Custom compensation component"
};

const formatCurrency = (value: string | number): string => {
  if (!value) return '';
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
};

const formatDecimal = (value: string | number): string => {
  if (!value) return '';
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : value;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

const formatNumber = (value: string | number): string => {
  if (!value) return '';
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : value;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
};

const CompensationCalculator: React.FC = () => {
  const navigate = useNavigate();
  const [specialty, setSpecialty] = useState<string>('');
  const [provider, setProvider] = useState<string>('');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [components, setComponents] = useState<CompensationComponent[]>([]);
  const [showComponents, setShowComponents] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingComponent, setEditingComponent] = useState<CompensationComponent | null>(null);
  const [newComponent, setNewComponent] = useState<Partial<CompensationComponent>>({
    type: 'custom',
    name: '',
    description: '',
    amount: 0
  });

  useEffect(() => {
    // Load providers and specialties from local storage
    const storedData = localStorage.getItem('employeeData');
    if (storedData) {
      const data = JSON.parse(storedData);
      setProviders(data);
      const uniqueSpecialties = Array.from(new Set(data.map((p: Provider) => p.specialty)));
      setSpecialties(uniqueSpecialties);
    }
  }, []);

  // Filter providers based on selected specialty
  const filteredProviders = providers.filter(
    (p) => !specialty || p.specialty === specialty
  );

  const handleProviderSelect = (providerName: string) => {
    console.log('Provider selected:', providerName);
    setProvider(providerName);
    const selected = providers.find(p => p.full_name === providerName);
    if (selected) {
      console.log('Selected provider full data:', selected);
      setSelectedProvider(selected);

      // Create initial components with the provider's data
      const initialComponents = [
        {
          id: '1',
          type: 'base',
          name: 'Clinical Base Pay',
          description: defaultDescriptions.base,
          amount: Number(selected.base_pay) || 0,
          fte: 1.0,
          wrvus: 0
        },
        {
          id: '2',
          type: 'wrvu',
          name: 'wRVU Incentive',
          description: defaultDescriptions.wrvu,
          amount: Number(selected.wrvu_incentive) || 0,
          fte: 1.0,
          wrvus: Number(selected.annual_wrvus) || 0,
          conversion_factor: Number(selected.conversion_factor) || 0
        },
        {
          id: '3',
          type: 'quality',
          name: 'Quality Payments',
          description: defaultDescriptions.quality,
          amount: Number(selected.quality_payments) || 0,
          fte: 1.0,
          wrvus: 0
        },
        {
          id: '4',
          type: 'admin',
          name: 'Administrative Payments',
          description: defaultDescriptions.admin,
          amount: Number(selected.admin_payments) || 0,
          fte: 0.2,
          wrvus: 0
        }
      ];

      console.log('Setting initial components:', initialComponents);
      setComponents(initialComponents);
      setShowComponents(true);
      setSpecialty(selected.specialty);

      // Calculate total compensation
      const total = initialComponents.reduce((sum, comp) => sum + Number(comp.amount), 0);

      // Save the result
      const result = {
        provider: {
          name: providerName,
          specialty: selected.specialty,
          components: initialComponents,
          total: total,
          wrvus: Number(selected.annual_wrvus) || 0,
          perWrvu: Number(selected.conversion_factor) || 0,
          componentTotals: {
            baseTotal: Number(selected.base_pay) || 0,
            productivityTotal: Number(selected.wrvu_incentive) || 0,
            qualityTotal: Number(selected.quality_payments) || 0,
            adminTotal: Number(selected.admin_payments) || 0,
            callTotal: 0
          }
        }
      };

      console.log('Saving initial result:', result);
      localStorage.setItem('compensationResults', JSON.stringify(result));
    }
  };

  const handleComponentChange = (id: string, field: keyof CompensationComponent, value: number) => {
    setComponents(prev => prev.map(comp => 
      comp.id === id ? { ...comp, [field]: value } : comp
    ));
  };

  const handleCalculate = () => {
    if (!provider || !components.length) {
      console.log('No provider or components selected');
      return;
    }

    console.log('Selected provider:', provider);
    console.log('Components before saving:', components);

    // Calculate total compensation
    const total = components.reduce((sum, comp) => sum + Number(comp.amount), 0);

    // Find each component
    const baseComponent = components.find(c => c.type === 'base');
    const wrvuComponent = components.find(c => c.type === 'wrvu');
    const qualityComponent = components.find(c => c.type === 'quality');
    const adminComponent = components.find(c => c.type === 'admin');

    console.log('Found components:', {
      base: baseComponent,
      wrvu: wrvuComponent,
      quality: qualityComponent,
      admin: adminComponent
    });

    // Create the result object
    const result = {
      provider: {
        name: provider,
        specialty: specialty,
        components: components,
        total: total,
        wrvus: Number(wrvuComponent?.wrvus || 0),
        perWrvu: Number(wrvuComponent?.conversion_factor || 0),
        componentTotals: {
          baseTotal: Number(baseComponent?.amount || 0),
          productivityTotal: Number(wrvuComponent?.amount || 0),
          qualityTotal: Number(qualityComponent?.amount || 0),
          adminTotal: Number(adminComponent?.amount || 0),
          callTotal: 0
        }
      }
    };

    console.log('Saving final result:', result);
    localStorage.setItem('compensationResults', JSON.stringify(result));
    navigate('/results');
  };

  const handleAddComponent = () => {
    setNewComponent({
      type: 'custom',
      name: '',
      description: '',
      amount: 0
    });
    setIsModalVisible(true);
  };

  const handleSaveComponent = () => {
    if (newComponent.name && newComponent.description) {
      const component: CompensationComponent = {
        id: `custom-${Date.now()}`,
        type: 'custom',
        name: newComponent.name,
        description: newComponent.description,
        amount: newComponent.amount || 0,
        fte: newComponent.fte || 0,
        wrvus: 0
      };
      setComponents(prevComponents => [...prevComponents, component]);
      setIsModalVisible(false);
      setNewComponent({
        type: 'custom',
        name: '',
        description: '',
        amount: 0,
        fte: 0
      });
    }
  };

  const handleEditComponent = (component: CompensationComponent) => {
    setEditingComponent(component);
    setIsModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (editingComponent) {
      setComponents(components.map(c => 
        c.id === editingComponent.id ? editingComponent : c
      ));
      setIsModalVisible(false);
      setEditingComponent(null);
    }
  };

  const handleDeleteComponent = (id: string) => {
    setComponents(prevComponents => prevComponents.filter(comp => comp.id !== id));
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      <Card 
        title="Provider Selection" 
        style={{ 
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#1a3353'
            }}>
              Select Specialty
            </label>
            <Select
              placeholder="Select a specialty..."
              style={{ width: '100%' }}
              value={specialty}
              onChange={setSpecialty}
              options={specialties.map(s => ({ value: s, label: s }))}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#1a3353'
            }}>
              Select Provider
            </label>
            <Select
              placeholder="Select a provider..."
              style={{ width: '100%' }}
              value={provider}
              onChange={handleProviderSelect}
              options={filteredProviders.map(p => ({ 
                value: p.full_name, 
                label: p.full_name 
              }))}
              disabled={!specialty}
            />
          </div>

          {showComponents && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Compensation Components</h3>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={handleAddComponent}
                  className="bg-blue-600 hover:bg-blue-700 border-none flex items-center"
                >
                  Add Component
                </Button>
              </div>
              
              <div className="grid gap-6">
                {components.map(comp => (
                  <Card 
                    key={comp.id} 
                    className="shadow-sm hover:shadow-md transition-shadow"
                    style={{ borderRadius: '8px' }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <Text strong className="text-lg mr-2">{comp.name}</Text>
                        <Tooltip title={comp.description || defaultDescriptions[comp.type]}>
                          <InfoCircleOutlined className="text-gray-400 hover:text-gray-600" />
                        </Tooltip>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          icon={<EditOutlined />} 
                          type="text"
                          onClick={() => handleEditComponent(comp)}
                        />
                        {comp.type === 'custom' && (
                          <Popconfirm
                            title="Delete Component"
                            description="Are you sure you want to delete this component?"
                            onConfirm={() => handleDeleteComponent(comp.id)}
                            okText="Yes"
                            cancelText="No"
                          >
                            <Button 
                              icon={<DeleteOutlined />} 
                              type="text"
                              danger
                            />
                          </Popconfirm>
                        )}
                      </div>
                    </div>
                    
                    <div className={`grid gap-6 ${comp.type === 'wrvu' ? 'grid-cols-1 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-3'}`}>
                      <div>
                        <Text className="block text-sm text-gray-500 mb-1">Amount</Text>
                        <Input
                          value={formatCurrency(comp.amount)}
                          onChange={e => {
                            const value = e.target.value.replace(/[^0-9.]/g, '');
                            handleComponentChange(comp.id, 'amount', Number(value));
                          }}
                          style={{ 
                            width: '100%',
                            height: '32px',
                            padding: '4px 11px',
                            fontSize: '14px',
                            textAlign: 'right'
                          }}
                          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <Text className="block text-sm text-gray-500 mb-1">FTE</Text>
                        <Input
                          value={formatDecimal(comp.fte)}
                          onChange={e => {
                            const value = Math.min(1, Math.max(0, Number(e.target.value.replace(/[^0-9.]/g, ''))));
                            handleComponentChange(comp.id, 'fte', value);
                          }}
                          style={{ 
                            width: '100%',
                            height: '32px',
                            padding: '4px 8px',
                            fontSize: '14px',
                            textAlign: 'right'
                          }}
                          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      
                      {comp.type === 'wrvu' && (
                        <>
                          <div>
                            <Text className="block text-sm text-gray-500 mb-1">Annual wRVUs</Text>
                            <Input
                              value={formatNumber(comp.wrvus)}
                              onChange={e => {
                                const value = e.target.value.replace(/[^0-9.]/g, '');
                                handleComponentChange(comp.id, 'wrvus', Number(value));
                              }}
                              style={{ 
                                width: '100%',
                                height: '32px',
                                padding: '4px 11px',
                                fontSize: '14px',
                                textAlign: 'right'
                              }}
                              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <Text className="block text-sm text-gray-500 mb-1">Conversion Factor</Text>
                            <Input
                              value={formatCurrency(comp.conversion_factor)}
                              onChange={e => {
                                const value = e.target.value.replace(/[^0-9.]/g, '');
                                handleComponentChange(comp.id, 'conversion_factor', Number(value));
                              }}
                              style={{ 
                                width: '100%',
                                height: '32px',
                                padding: '4px 11px',
                                fontSize: '14px',
                                textAlign: 'right'
                              }}
                              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <Modal
            title={editingComponent ? "Edit Component" : "Add New Component"}
            open={isModalVisible}
            onOk={editingComponent ? handleSaveEdit : handleSaveComponent}
            onCancel={() => {
              setIsModalVisible(false);
              setEditingComponent(null);
            }}
            width={600}
          >
            <Form layout="vertical">
              <Form.Item label="Component Name" required>
                <Input
                  value={editingComponent?.name || newComponent.name}
                  onChange={e => {
                    if (editingComponent) {
                      setEditingComponent({ ...editingComponent, name: e.target.value });
                    } else {
                      setNewComponent({ ...newComponent, name: e.target.value });
                    }
                  }}
                  placeholder="Enter component name"
                />
              </Form.Item>
              
              <Form.Item label="Description" required>
                <Input.TextArea
                  value={editingComponent?.description || newComponent.description}
                  onChange={e => {
                    if (editingComponent) {
                      setEditingComponent({ ...editingComponent, description: e.target.value });
                    } else {
                      setNewComponent({ ...newComponent, description: e.target.value });
                    }
                  }}
                  placeholder="Enter component description"
                  rows={4}
                />
              </Form.Item>

              <Form.Item label="Initial Amount">
                <Input
                  type="number"
                  prefix="$"
                  value={editingComponent?.amount || newComponent.amount}
                  onChange={e => {
                    const value = Number(e.target.value);
                    if (editingComponent) {
                      setEditingComponent({ ...editingComponent, amount: value });
                    } else {
                      setNewComponent({ ...newComponent, amount: value });
                    }
                  }}
                  placeholder="0.00"
                  style={{ 
                    width: '100%',
                    height: '32px',
                    padding: '4px 11px',
                    fontSize: '14px'
                  }}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </Form.Item>

              <Form.Item label="FTE (0.0 - 1.0)">
                <Input
                  type="number"
                  value={(editingComponent?.fte || newComponent.fte || 0).toFixed(2)}
                  onChange={e => {
                    const value = Math.min(1, Math.max(0, Number(e.target.value)));
                    if (editingComponent) {
                      setEditingComponent({ ...editingComponent, fte: value });
                    } else {
                      setNewComponent({ ...newComponent, fte: value });
                    }
                  }}
                  min={0}
                  max={1}
                  step={0.01}
                  style={{ 
                    width: '80px',
                    height: '32px',
                    padding: '4px 8px',
                    fontSize: '14px',
                    textAlign: 'right'
                  }}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </Form.Item>
            </Form>
          </Modal>

          <div style={{ marginTop: '24px' }}>
            <Button 
              type="primary"
              onClick={handleCalculate}
              disabled={!specialty || !provider}
              className="w-full h-10 text-base bg-blue-600 hover:bg-blue-700 border-none font-medium flex items-center justify-center text-white"
              style={{
                backgroundColor: '#2563eb',
                borderColor: '#2563eb',
                color: 'white'
              }}
            >
              Calculate FMV Analysis
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CompensationCalculator; 