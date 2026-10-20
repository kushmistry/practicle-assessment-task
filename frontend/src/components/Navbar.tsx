import React from 'react';
import { Layout, Button, Typography, Space } from 'antd';
import { Newspaper, PlusCircle } from 'lucide-react';

const { Header } = Layout;
const { Title, Text } = Typography;

interface NavbarProps {
  onOpenCreateModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCreateModal }) => {
  return (
    <Header
      style={{
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        borderBottom: '1px solid #e2e8f0',
        minHeight: '64px',
        height: 'auto',
        lineHeight: 'normal',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          lineHeight: 'normal',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)',
            padding: '10px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            flexShrink: 0,
            boxShadow: '0 2px 6px rgba(22, 119, 255, 0.25)',
          }}
        >
          <Newspaper size={22} />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            lineHeight: 'normal',
          }}
        >
          <Title
            level={4}
            style={{
              margin: 0,
              padding: 0,
              lineHeight: 1.3,
              fontSize: '18px',
              fontWeight: 700,
              color: '#0f172a',
              letterSpacing: '-0.01em',
            }}
          >
            Company News Dashboard
          </Title>
          <Text
            type="secondary"
            style={{
              margin: 0,
              padding: 0,
              fontSize: '12px',
              lineHeight: 1.4,
              color: '#64748b',
              display: 'block',
            }}
          >
            Part B — Full-Stack News Processing & Management
          </Text>
        </div>
      </div>

      <Space>
        <Button
          type="primary"
          icon={<PlusCircle size={16} />}
          onClick={onOpenCreateModal}
          size="middle"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 500,
            borderRadius: '6px',
            height: '38px',
            padding: '0 16px',
          }}
        >
          Add Article
        </Button>
      </Space>
    </Header>
  );
};
