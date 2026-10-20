import React from 'react';
import { Row, Col, Card, Typography, Spin } from 'antd';
import { FileText, Clock, CheckCircle2 } from 'lucide-react';

const { Text, Title } = Typography;

interface StatsCardsProps {
  total: number;
  loading: boolean;
  pendingCount?: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ total, loading, pendingCount = 0 }) => {
  const cards = [
    {
      title: 'Total Articles',
      value: total,
      icon: <FileText size={22} color="#1677ff" />,
      bgColor: '#e6f4ff',
      borderColor: '#91caff',
    },
    {
      title: 'Pending Processing',
      value: pendingCount || total,
      icon: <Clock size={22} color="#faad14" />,
      bgColor: '#fffbe6',
      borderColor: '#ffe58f',
    },
    {
      title: 'Phase 2 Ready',
      value: 'Enabled',
      isText: true,
      icon: <CheckCircle2 size={22} color="#52c41a" />,
      bgColor: '#f6ffed',
      borderColor: '#b7eb8f',
    },
  ];

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
      {cards.map((item, idx) => (
        <Col xs={24} sm={8} key={idx}>
          <Card
            bordered={false}
            style={{
              borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
              border: `1px solid ${item.borderColor}`,
              backgroundColor: '#ffffff',
            }}
            bodyStyle={{ padding: '20px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Text type="secondary" style={{ fontSize: '13px', fontWeight: 500 }}>
                  {item.title}
                </Text>
                <div style={{ marginTop: '6px' }}>
                  {loading ? (
                    <Spin size="small" />
                  ) : item.isText ? (
                    <Title level={3} style={{ margin: 0, color: '#389e0d', fontSize: '22px' }}>
                      {item.value}
                    </Title>
                  ) : (
                    <Title level={3} style={{ margin: 0, fontSize: '26px', fontWeight: 700 }}>
                      {item.value}
                    </Title>
                  )}
                </div>
              </div>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '10px',
                  backgroundColor: item.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

