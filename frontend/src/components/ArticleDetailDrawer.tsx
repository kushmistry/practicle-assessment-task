import React from 'react';
import { Drawer, Typography, Tag, Space, Descriptions, Divider, Alert, Button } from 'antd';
import { ExternalLink, Building2, Calendar, FileText, Info } from 'lucide-react';
import type { Article } from '../types/article';

const { Title, Paragraph, Text } = Typography;

interface ArticleDetailDrawerProps {
  article: Article | null;
  visible: boolean;
  onClose: () => void;
}

export const ArticleDetailDrawer: React.FC<ArticleDetailDrawerProps> = ({
  article,
  visible,
  onClose,
}) => {
  if (!article) return null;

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString();
    } catch {
      return isoString;
    }
  };

  return (
    <Drawer
      title={
        <Space size={8}>
          <FileText size={18} color="#1677ff" />
          <span>Article Details #{article.id}</span>
        </Space>
      }
      placement="right"
      width={640}
      onClose={onClose}
      open={visible}
      extra={
        <Button
          type="link"
          href={article.url}
          target="_blank"
          icon={<ExternalLink size={14} />}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          Open Source
        </Button>
      }
    >
      <Title level={4} style={{ marginTop: 0, marginBottom: '16px' }}>
        {article.title}
      </Title>

      <Descriptions column={2} size="middle" bordered style={{ marginBottom: '20px' }}>
        <Descriptions.Item label="Company">
          <Space size={4}>
            <Building2 size={15} color="#1677ff" />
            <Text strong>{article.company_name}</Text>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={article.status === 'PENDING' ? 'warning' : 'success'}>
            {article.status}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Created At" span={2}>
          <Space size={4}>
            <Calendar size={15} color="#8c8c8c" />
            <Text type="secondary">{formatDate(article.created_at)}</Text>
          </Space>
        </Descriptions.Item>
      </Descriptions>

      {/* Phase 1 / Phase 2 Processing Details */}
      <Alert
        message="Classification & Summarization (Phase 2)"
        description="Category and Summary fields are intentionally initialized as NULL during Phase 1 article creation. Automated classification and background summarization will process them in Phase 2."
        type="info"
        showIcon
        icon={<Info size={18} />}
        style={{ marginBottom: '20px', borderRadius: '8px' }}
      />

      <Descriptions column={1} size="small" bordered style={{ marginBottom: '20px' }}>
        <Descriptions.Item label="Category">
          {article.category ? (
            <Tag color="blue">{article.category}</Tag>
          ) : (
            <Text type="secondary" italic>Empty (Phase 2)</Text>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Summary">
          {article.summary ? (
            <Paragraph style={{ margin: 0 }}>{article.summary}</Paragraph>
          ) : (
            <Text type="secondary" italic>Empty (Phase 2)</Text>
          )}
        </Descriptions.Item>
      </Descriptions>

      <Divider titlePlacement="start" style={{ margin: '16px 0' }}>
        Article Content
      </Divider>

      <div
        style={{
          background: '#fafafa',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #f0f0f0',
          maxHeight: '400px',
          overflowY: 'auto',
          lineHeight: '1.7',
          whiteSpace: 'pre-wrap',
          color: '#262626',
          fontSize: '14px',
        }}
      >
        {article.content}
      </div>
    </Drawer>
  );
};
