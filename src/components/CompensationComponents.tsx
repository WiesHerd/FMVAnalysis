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

  const showAddModal = () => {
    setEditingComponent(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (component: Component) => {
    setEditingComponent(component);
    form.setFieldsValue(component);
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingComponent) {
        const updatedComponents = components.map(c =>
          c.id === editingComponent.id ? { ...c, ...values } : c
        );
        setComponents(updatedComponents);
        onChange(updatedComponents);
      } else {
        const newComponent = {
          ...values,
          id: Date.now().toString(),
        };
        const updatedComponents = [...components, newComponent];
        setComponents(updatedComponents);
        onChange(updatedComponents);
      }
      setIsModalVisible(false);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleDelete = (componentId: string) => {
    const updatedComponents = components.filter(c => c.id !== componentId);
    setComponents(updatedComponents);
    onChange(updatedComponents);
  };

  const totalCompensation = components.reduce((sum, c) => sum + (c.amount || 0), 0);

  const getComponentColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'base': return 'bg-blue-50';
      case 'wrvu': return 'bg-green-50';
      case 'quality': return 'bg-purple-50';
      case 'call': return 'bg-indigo-50';
      case 'admin': return 'bg-orange-50';
      default: return 'bg-gray-50';
    }
  };

  const getComponentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'base':
        return (
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </div>
        );
      case 'wrvu':
        return (
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'quality':
        return (
          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'call':
        return (
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
          </div>
        );
      case 'admin':
        return (
          <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={showAddModal}
          className="print:hidden ml-auto"
        >
          Add Component
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              {getComponentIcon(component.type)}
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

export default CompensationComponents; 