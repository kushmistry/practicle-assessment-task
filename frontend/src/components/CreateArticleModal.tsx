import React, { useState } from 'react';
import { Modal, Form, Input, Button, Alert, message } from 'antd';
import { PlusCircle, Building2, FileText, Globe, Info } from 'lucide-react';
import { useCreateArticleMutation } from '../store/services/articlesApi';
import type { ArticleCreatePayload } from '../types/article';

const { TextArea } = Input;

interface CreateArticleModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CreateArticleModal: React.FC<CreateArticleModalProps> = ({ visible, onClose }) => {
  const [form] = Form.useForm<ArticleCreatePayload>();
  const [createArticle, { isLoading }] = useCreateArticleMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setErrorMessage(null);
      const res = await createArticle(values).unwrap();

      if (res.status === 'success') {
        message.success(res.message || 'Article created successfully!');
        form.resetFields();
        onClose();
      } else {
        setErrorMessage(res.message || 'Failed to create article');
      }
    } catch (err: unknown) {
      console.error('Create article error:', err);
      const apiErr = err as { data?: { message?: string }; message?: string };
      if (apiErr?.data?.message) {
        setErrorMessage(apiErr.data.message);
      } else if (apiErr?.message) {
        setErrorMessage(apiErr.message);
      } else {
        setErrorMessage('Failed to create article. Please check your network or inputs.');
      }
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setErrorMessage(null);
    onClose();
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PlusCircle size={20} color="#1677ff" />
          <span>Add New Company News Article</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel} disabled={isLoading}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={isLoading}
          onClick={handleSubmit}
          style={{ borderRadius: '6px' }}
        >
          Create Article
        </Button>,
      ]}
      width={560}
      destroyOnClose
    >
      <Alert
        message="Phase 1 Creation Notice"
        description="Category and summary are automatically initialized as NULL. Background processing will populate them in Phase 2."
        type="info"
        showIcon
        icon={<Info size={16} />}
        style={{ marginBottom: '18px', borderRadius: '6px' }}
      />

      {errorMessage && (
        <Alert
          message="Submission Error"
          description={errorMessage}
          type="error"
          showIcon
          closable
          onClose={() => setErrorMessage(null)}
          style={{ marginBottom: '16px', borderRadius: '6px' }}
        />
      )}

      <Form form={form} layout="vertical" requiredMark="optional">
        <Form.Item
          name="company_name"
          label="Company Name"
          rules={[
            { required: true, message: 'Please enter company name' },
            { whitespace: true, message: 'Company name cannot be blank' },
          ]}
        >
          <Input
            placeholder="e.g. NVIDIA, Apple, Microsoft"
            prefix={<Building2 size={16} color="#8c8c8c" />}
            style={{ borderRadius: '6px' }}
          />
        </Form.Item>

        <Form.Item
          name="title"
          label="Article Headline / Title"
          rules={[
            { required: true, message: 'Please enter article title' },
            { whitespace: true, message: 'Title cannot be blank' },
          ]}
        >
          <Input
            placeholder="e.g. NVIDIA announces next-gen architecture"
            prefix={<FileText size={16} color="#8c8c8c" />}
            style={{ borderRadius: '6px' }}
          />
        </Form.Item>

        <Form.Item
          name="url"
          label="News Source URL"
          rules={[
            { required: true, message: 'Please enter source URL' },
            { type: 'url', message: 'Please enter a valid URL (e.g. https://...)' },
          ]}
        >
          <Input
            placeholder="https://example.com/news/article-slug"
            prefix={<Globe size={16} color="#8c8c8c" />}
            style={{ borderRadius: '6px' }}
          />
        </Form.Item>

        <Form.Item
          name="content"
          label="Article Content"
          rules={[
            { required: true, message: 'Please enter article body content' },
            { whitespace: true, message: 'Content cannot be blank' },
            { min: 10, message: 'Content must be at least 10 characters' },
          ]}
        >
          <TextArea
            rows={5}
            placeholder="Paste or write full news text here..."
            style={{ borderRadius: '6px' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
