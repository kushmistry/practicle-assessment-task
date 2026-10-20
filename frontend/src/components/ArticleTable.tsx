import React from 'react';
import { Table, Tag, Button, Typography, Space, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ExternalLink, Eye, Building2 } from 'lucide-react';
import type { Article, PaginationMeta } from '../types/article';

const { Text, Link } = Typography;

interface ArticleTableProps {
  articles: Article[];
  loading: boolean;
  pagination: PaginationMeta | null;
  onPageChange: (page: number, pageSize: number) => void;
  onSelectArticle: (article: Article) => void;
}

export const ArticleTable: React.FC<ArticleTableProps> = ({
  articles,
  loading,
  pagination,
  onPageChange,
  onSelectArticle,
}) => {
  const getStatusTag = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return <Tag color="warning" style={{ borderRadius: '4px', fontWeight: 500 }}>PENDING</Tag>;
      case 'PROCESSED':
        return <Tag color="success" style={{ borderRadius: '4px', fontWeight: 500 }}>PROCESSED</Tag>;
      default:
        return <Tag color="default" style={{ borderRadius: '4px' }}>{status}</Tag>;
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const columns: ColumnsType<Article> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      render: (id: number) => <Text type="secondary">#{id}</Text>,
    },
    {
      title: 'Company',
      dataIndex: 'company_name',
      key: 'company_name',
      width: 180,
      render: (company: string) => (
        <Space size={6}>
          <Building2 size={16} orientation="horizontal" color="#1677ff" />
          <Text strong style={{ color: '#1f1f1f' }}>
            {company}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Headline / Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (title: string, record: Article) => (
        <Tooltip title="Click to view details">
          <Link
            onClick={() => onSelectArticle(record)}
            style={{ fontWeight: 500, color: '#0958d9' }}
          >
            {title}
          </Link>
        </Tooltip>
      ),
    },
    {
      title: 'Source URL',
      dataIndex: 'url',
      key: 'url',
      width: 130,
      render: (url: string) => (
        <Tooltip title={url}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#595959' }}
          >
            <span>Visit</span>
            <ExternalLink size={13} />
          </a>
        </Tooltip>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (created_at: string) => (
        <Text type="secondary" style={{ fontSize: '13px' }}>
          {formatDate(created_at)}
        </Text>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      align: 'center',
      render: (_, record: Article) => (
        <Button
          type="text"
          size="small"
          icon={<Eye size={16} color="#1677ff" />}
          onClick={() => onSelectArticle(record)}
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        />
      ),
    },
  ];

  return (
    <Table<Article>
      columns={columns}
      dataSource={articles}
      rowKey="id"
      loading={loading}
      pagination={{
        current: pagination?.page || 1,
        pageSize: pagination?.page_size || 10,
        total: pagination?.total || 0,
        showSizeChanger: true,
        pageSizeOptions: ['5', '10', '20', '50'],
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} articles`,
        onChange: onPageChange,
        style: { marginTop: '16px', marginBottom: '8px', marginRight: '8px' },
      }}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
      }}
    />
  );
};

