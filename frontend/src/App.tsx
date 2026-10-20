import React, { useState, useEffect } from 'react';
import { Layout, ConfigProvider, Typography, Alert } from 'antd';
import { AlertCircle } from 'lucide-react';
import { useGetArticlesQuery } from './store/services/articlesApi';
import { Navbar } from './components/Navbar';
import { StatsCards } from './components/StatsCards';
import { ArticleFilters } from './components/ArticleFilters';
import { ArticleTable } from './components/ArticleTable';
import { CreateArticleModal } from './components/CreateArticleModal';
import { ArticleDetailDrawer } from './components/ArticleDetailDrawer';
import type { Article } from './types/article';

const { Content, Footer } = Layout;
const { Text } = Typography;

export const App: React.FC = () => {
  // Filters & Pagination State
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [companyName, setCompanyName] = useState<string>('');
  const [debouncedCompany, setDebouncedCompany] = useState<string>('');
  const [status, setStatus] = useState<string | undefined>(undefined);

  // Modal & Drawer State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Debounce search input for company name (400ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCompany(companyName);
      setPage(1); // Reset to page 1 on new filter
    }, 400);

    return () => clearTimeout(handler);
  }, [companyName]);

  // Query articles via RTK Query
  const { data, isLoading, isFetching, error, refetch } = useGetArticlesQuery({
    page,
    page_size: pageSize,
    company_name: debouncedCompany,
    status: status || undefined,
  });

  const articles = data?.data || [];
  const pagination = data?.meta || null;
  const totalArticles = pagination?.total || 0;

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  const handleResetFilters = () => {
    setCompanyName('');
    setDebouncedCompany('');
    setStatus(undefined);
    setPage(1);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
      }}
    >
      <Layout style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <Navbar onOpenCreateModal={() => setIsCreateModalOpen(true)} />

        <Content
          style={{
            maxWidth: '1280px',
            width: '100%',
            margin: '0 auto',
            padding: '24px 20px',
          }}
        >
          {/* Top Overview Cards */}
          <StatsCards
            total={totalArticles}
            loading={isLoading}
            pendingCount={articles.filter((a) => a.status === 'PENDING').length}
          />

          {/* Network / Backend Error Alert */}
          {error && (
            <Alert
              message="Failed to connect to Backend API"
              description="Could not load articles. Ensure the FastAPI backend server is running on http://localhost:8000 and PostgreSQL is healthy."
              type="error"
              showIcon
              icon={<AlertCircle size={18} />}
              style={{ marginBottom: '20px', borderRadius: '8px' }}
            />
          )}

          {/* Search & Filters */}
          <ArticleFilters
            companyName={companyName}
            status={status}
            onCompanyChange={setCompanyName}
            onStatusChange={(val) => {
              setStatus(val);
              setPage(1);
            }}
            onReset={handleResetFilters}
            onRefresh={refetch}
            isFetching={isFetching}
          />

          {/* Articles Data Table */}
          <ArticleTable
            articles={articles}
            loading={isLoading || isFetching}
            pagination={pagination}
            onPageChange={handlePageChange}
            onSelectArticle={setSelectedArticle}
          />
        </Content>

        <Footer style={{ textAlign: 'center', backgroundColor: '#ffffff', borderTop: '1px solid #f0f0f0' }}>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            Company News Processing Dashboard © 2026 — Part B Full-Stack Implementation
          </Text>
        </Footer>

        {/* Create Article Modal */}
        <CreateArticleModal
          visible={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />

        {/* View Details Drawer */}
        <ArticleDetailDrawer
          article={selectedArticle}
          visible={Boolean(selectedArticle)}
          onClose={() => setSelectedArticle(null)}
        />
      </Layout>
    </ConfigProvider>
  );
};

export default App;
