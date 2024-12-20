import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Radio, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

interface ReviewFormProps {
  providerId: string;
  providerName: string;
  currentRiskLevel: 'Low' | 'Medium' | 'High';
  onReviewComplete: () => void;
}

interface ReviewData {
  provider_id: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  review_date: string | null;
  reviewer: string;
  comments: string;
  risk_level: 'Low' | 'Medium' | 'High';
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  providerId,
  providerName,
  currentRiskLevel,
  onReviewComplete
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load existing review data if available
    const savedReviews = localStorage.getItem('providerReviews');
    if (savedReviews) {
      const reviews = JSON.parse(savedReviews);
      const existingReview = reviews[providerId];
      if (existingReview) {
        form.setFieldsValue({
          status: existingReview.status,
          reviewer: existingReview.reviewer,
          comments: existingReview.comments,
          risk_level: existingReview.risk_level
        });
      }
    }
  }, [providerId, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const reviewData: ReviewData = {
        provider_id: providerId,
        status: values.status,
        review_date: new Date().toISOString(),
        reviewer: values.reviewer,
        comments: values.comments,
        risk_level: currentRiskLevel
      };

      // Load existing reviews
      const savedReviews = localStorage.getItem('providerReviews');
      const reviews = savedReviews ? JSON.parse(savedReviews) : {};

      // Add new review
      reviews[providerId] = reviewData;

      // Save back to localStorage
      localStorage.setItem('providerReviews', JSON.stringify(reviews));

      message.success('Review saved successfully');
      onReviewComplete();
    } catch (error) {
      message.error('Error saving review');
      console.error('Error saving review:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Provider Review</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          status: 'Pending'
        }}
      >
        <Form.Item
          name="status"
          label="Review Status"
          rules={[{ required: true, message: 'Please select a status' }]}
        >
          <Radio.Group buttonStyle="solid">
            <Radio.Button 
              value="Approved" 
              className="hover:!bg-blue-600 hover:!text-white [&.ant-radio-button-wrapper-checked]:!bg-blue-600 [&.ant-radio-button-wrapper-checked]:!text-white [&.ant-radio-button-wrapper-checked]:!border-blue-600"
            >
              Approve
            </Radio.Button>
            <Radio.Button 
              value="Rejected" 
              className="hover:!bg-blue-600 hover:!text-white [&.ant-radio-button-wrapper-checked]:!bg-blue-600 [&.ant-radio-button-wrapper-checked]:!text-white [&.ant-radio-button-wrapper-checked]:!border-blue-600"
            >
              Reject
            </Radio.Button>
            <Radio.Button 
              value="Pending" 
              className="hover:!bg-blue-600 hover:!text-white [&.ant-radio-button-wrapper-checked]:!bg-blue-600 [&.ant-radio-button-wrapper-checked]:!text-white [&.ant-radio-button-wrapper-checked]:!border-blue-600"
            >
              Mark as Pending
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="reviewer"
          label="Reviewer Name"
          rules={[{ required: true, message: 'Please enter reviewer name' }]}
        >
          <Input placeholder="Enter your name" />
        </Form.Item>

        <Form.Item
          name="comments"
          label="Review Comments"
          rules={[{ required: true, message: 'Please enter review comments' }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Enter your review comments, observations, and recommendations"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={loading}
            className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
          >
            Save Review
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ReviewForm; 