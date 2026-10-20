import React from 'react';
import { Card, Input, Select, Button, Space } from 'antd';
import { Search, Filter, RotateCcw, RefreshCw } from 'lucide-react';

interface ArticleFiltersProps {
  companyName: string;
  status: string | undefined;
  onCompanyChange: (val: string) => void;
  onStatusChange: (val: string | undefined) => void;
  onReset: () => void;
  onRefresh: () => void;
  isFetching: boolean;
}

export const ArticleFilters: React.FC<ArticleFiltersProps> = ({
  companyName,
  status,
  onCompanyChange,
  onStatusChange,
  onReset,
  onRefresh,
  isFetching,
}) => {
  const hasActiveFilters = Boolean(companyName.trim() || status);

  return (
    <Card
      bordered={false}
      style={{
        borderRadius: '12px',
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
      }}
      bodyStyle={{ padding: '16px 20px' }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Space wrap size="middle" style={{ flex: 1 }}>
          <div style={{ minWidth: '240px' }}>
            <Input
              placeholder="Search by company name..."
              prefix={<Search size={16} color="#8c8c8c" />}
              allowClear
              value={companyName}
              onChange={(e) => onCompanyChange(e.target.value)}
              style={{ borderRadius: '6px' }}
            />
          </div>

          <div style={{ minWidth: '180px' }}>
            <Select
              placeholder="Filter by status"
              allowClear
              value={status}
              onChange={onStatusChange}
              style={{ width: '100%' }}
              suffixIcon={<Filter size={15} color="#8c8c8c" />}
              options={[
                { label: 'All Statuses', value: '' },
                { label: 'PENDING', value: 'PENDING' },
                { label: 'PROCESSED', value: 'PROCESSED' },
              ]}
            />
          </div>

          {hasActiveFilters && (
            <Button
              type="text"
              icon={<RotateCcw size={14} />}
              onClick={onReset}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ff4d4f' }}
            >
              Reset Filters
            </Button>
          )}
        </Space>

        <Space>
          <Button
            icon={<RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />}
            onClick={onRefresh}
            loading={isFetching}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '6px' }}
          >
            Refresh
          </Button>
        </Space>
      </div>
    </Card>
  );
};
