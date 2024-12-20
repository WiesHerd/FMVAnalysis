import React, { useState } from 'react';
import { Card, Button, Input, Modal, Form, InputNumber } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

interface Component {
  id: string;
  type: string;
  name: string;
  amount: number;
  fte?: number;
  wrvus?: number;
  conversion_factor?: number;
}

interface Props {
  onChange: (components: Component[]) => void;
  initialComponents: Component[];
}

const CompensationComponents: React.FC<Props> = ({ onChange, initialComponents }) => {
  const [components, setComponents] = useState<Component[]>(initialComponents);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingComponent, setEditingComponent] = useState<Component | null>(null);
  const [form] = Form.useForm();

  const handleComponentChange = (index: number, updates: Partial<Component>) => {
    const updatedComponents = components.map((c, i) => 
      i === index ? { ...c, ...updates } : c
    );
    setComponents(updatedComponents);
    onChange(updatedComponents);
  };

  const showAddModal = () => {
    form.resetFields();
    setEditingComponent(null);
    setIsModalVisible(true);
  };

  const showEditModal = (component: Component) => {
    setEditingComponent(component);
    form.setFieldsValue(component);
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (editingComponent) {
        // Edit existing component
        const updatedComponents = components.map(c => 
          c.id === editingComponent.id ? { ...c, ...values } : c
        );
        setComponents(updatedComponents);
        onChange(updatedComponents);
      } else {
        // Add new component
        const newComponent = {
          ...values,
          id: Math.random().toString(36).substr(2, 9),
          type: values.type || 'custom'
        };
        const updatedComponents = [...components, newComponent];
        setComponents(updatedComponents);
        onChange(updatedComponents);
      }
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const handleDelete = (componentId: string) => {
    const updatedComponents = components.filter(c => c.id !== componentId);
    setComponents(updatedComponents);
    onChange(updatedComponents);
  };

  const totalCompensation = components.reduce((sum, c) => sum + (c.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-light text-gray-900">Compensation Components</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={showAddModal}
          className="print:hidden"
        >
          Add Component
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {components.map((component, index) => (
          <div key={component.id} className={`bg-white rounded-lg border p-6 hover:shadow-md transition-shadow ${getComponentColor(component.type)}`}>
            <div className="flex justify-between items-start">
              <div className="flex-grow">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    {component.name}
                  </h3>
                  <div className="flex space-x-2 print:hidden">
                    <Button 
                      icon={<EditOutlined />} 
                      size="small"
                      onClick={() => showEditModal(component)}
                    />
                    <Button 
                      icon={<DeleteOutlined />} 
                      size="small" 
                      danger
                      onClick={() => handleDelete(component.id)}
                    />
                  </div>
                </div>
                <div className="mt-1 text-2xl font-light text-gray-900">
                  ${component.amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </div>
                {component.fte !== undefined && (
                  <div className="text-sm text-gray-500 mt-1">
                    FTE: {component.fte.toFixed(2)}
                  </div>
                )}
                {component.wrvus !== undefined && (
                  <div className="text-sm text-gray-500 mt-1">
                    wRVUs: {component.wrvus.toLocaleString()}
                  </div>
                )}
                {component.conversion_factor !== undefined && (
                  <div className="text-sm text-gray-500 mt-1">
                    Conversion Factor: ${component.conversion_factor.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 border-t">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Total Compensation</h2>
          <div className="text-2xl font-bold">
            ${totalCompensation.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </div>
        </div>
      </div>

      <Modal
        title={editingComponent ? "Edit Component" : "Add Component"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={editingComponent || {}}
        >
          <Form.Item
            name="name"
            label="Component Name"
            rules={[{ required: true, message: 'Please enter component name' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: 'Please enter amount' }]}
          >
            <InputNumber
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/\$\s?|(,*)/g, '')}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item name="type" label="Type">
            <Input />
          </Form.Item>

          <Form.Item name="fte" label="FTE (Optional)">
            <InputNumber
              min={0}
              max={1}
              step={0.1}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item name="wrvus" label="wRVUs (Optional)">
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

const getComponentColor = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'base':
      return 'border-blue-200';
    case 'incentive':
      return 'border-green-200';
    case 'quality':
      return 'border-emerald-200';
    case 'admin':
      return 'border-orange-200';
    case 'call':
      return 'border-purple-200';
    default:
      return 'border-gray-200';
  }
};

export default CompensationComponents; 