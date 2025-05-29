import React from 'react';
import { Row, Col, Card, Statistic, Typography, Progress, Table, Tag, Space, Button } from 'antd';
import {
  ShoppingOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  EyeOutlined,
  EditOutlined
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import styled from 'styled-components';

const { Title, Text } = Typography;

const PageHeader = styled.div`
  margin-bottom: 24px;
`;

const StatsCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
  
  .ant-card-body {
    padding: 24px;
  }
`;

const ChartCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
  
  .ant-card-head {
    border-bottom: 1px solid #f0f0f0;
  }
`;

// Mock data
const salesData = [
  { name: 'T2', value: 4000 },
  { name: 'T3', value: 3000 },
  { name: 'T4', value: 5000 },
  { name: 'T5', value: 4500 },
  { name: 'T6', value: 6000 },
  { name: 'T7', value: 5500 },
  { name: 'CN', value: 7000 },
];

const categoryData = [
  { name: 'Điện tử', value: 400, color: '#1890ff' },
  { name: 'Thời trang', value: 300, color: '#52c41a' },
  { name: 'Gia dụng', value: 200, color: '#faad14' },
  { name: 'Sách', value: 100, color: '#ff4d4f' },
];

const recentOrders = [
  {
    key: '1',
    orderId: 'DH001',
    customer: 'Nguyễn Văn A',
    amount: 1500000,
    status: 'completed',
    date: '2024-01-15',
  },
  {
    key: '2',
    orderId: 'DH002',
    customer: 'Trần Thị B',
    amount: 2300000,
    status: 'pending',
    date: '2024-01-15',
  },
  {
    key: '3',
    orderId: 'DH003',
    customer: 'Lê Văn C',
    amount: 890000,
    status: 'shipping',
    date: '2024-01-14',
  },
  {
    key: '4',
    orderId: 'DH004',
    customer: 'Phạm Thị D',
    amount: 3200000,
    status: 'completed',
    date: '2024-01-14',
  },
];

const lowStockProducts = [
  {
    key: '1',
    name: 'iPhone 15 Pro',
    sku: 'IP15P-128',
    stock: 5,
    minStock: 10,
    status: 'low',
  },
  {
    key: '2',
    name: 'Samsung Galaxy S24',
    sku: 'SGS24-256',
    stock: 2,
    minStock: 15,
    status: 'critical',
  },
  {
    key: '3',
    name: 'MacBook Air M3',
    sku: 'MBA-M3-512',
    stock: 8,
    minStock: 12,
    status: 'low',
  },
];

const Dashboard = () => {
  const orderColumns = [
    {
      title: 'Mã đơn',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <Text strong style={{ color: '#52c41a' }}>
          {amount.toLocaleString('vi-VN')} ₫
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          completed: { color: 'success', text: 'Hoàn thành' },
          pending: { color: 'warning', text: 'Chờ xử lý' },
          shipping: { color: 'processing', text: 'Đang giao' },
        };
        const config = statusConfig[status];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: () => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} size="small" />
          <Button type="text" icon={<EditOutlined />} size="small" />
        </Space>
      ),
    },
  ];

  const stockColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      render: (text) => <Text code>{text}</Text>,
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock, record) => (
        <div>
          <Text strong style={{ color: record.status === 'critical' ? '#ff4d4f' : '#faad14' }}>
            {stock}
          </Text>
          <Text type="secondary"> / {record.minStock}</Text>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const config = {
          low: { color: 'warning', text: 'Sắp hết' },
          critical: { color: 'error', text: 'Nguy hiểm' },
        };
        return <Tag color={config[status].color}>{config[status].text}</Tag>;
      },
    },
  ];

  return (
    <div className="fade-in">
      <PageHeader>
        <Title level={2} style={{ margin: 0, color: '#333' }}>
          Tổng quan hệ thống
        </Title>
        <Text type="secondary">
          Theo dõi hiệu suất kinh doanh và quản lý kho hàng
        </Text>
      </PageHeader>

      {/* Statistics Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard>
            <Statistic
              title="Tổng sản phẩm"
              value={1234}
              prefix={<ShoppingOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff', fontSize: '28px', fontWeight: 600 }}
              suffix={
                <span style={{ fontSize: '14px', color: '#52c41a' }}>
                  <ArrowUpOutlined /> 12%
                </span>
              }
            />
          </StatsCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard>
            <Statistic
              title="Tồn kho"
              value={5678}
              prefix={<InboxOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontSize: '28px', fontWeight: 600 }}
              suffix={
                <span style={{ fontSize: '14px', color: '#ff4d4f' }}>
                  <ArrowDownOutlined /> 3%
                </span>
              }
            />
          </StatsCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard>
            <Statistic
              title="Đơn hàng hôm nay"
              value={89}
              prefix={<ShoppingCartOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14', fontSize: '28px', fontWeight: 600 }}
              suffix={
                <span style={{ fontSize: '14px', color: '#52c41a' }}>
                  <ArrowUpOutlined /> 8%
                </span>
              }
            />
          </StatsCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard>
            <Statistic
              title="Khách hàng"
              value={2456}
              prefix={<UserOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1', fontSize: '28px', fontWeight: 600 }}
              suffix={
                <span style={{ fontSize: '14px', color: '#52c41a' }}>
                  <ArrowUpOutlined /> 15%
                </span>
              }
            />
          </StatsCard>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <ChartCard title="Doanh thu 7 ngày qua" extra={<Button type="link">Xem chi tiết</Button>}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value.toLocaleString()} ₫`, 'Doanh thu']} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#1890ff" 
                  strokeWidth={3}
                  dot={{ fill: '#1890ff', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </Col>
        <Col xs={24} lg={8}>
          <ChartCard title="Phân loại sản phẩm" extra={<Button type="link">Xem chi tiết</Button>}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} sản phẩm`, 'Số lượng']} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              {categoryData.map((item, index) => (
                <Tag key={index} color={item.color} style={{ margin: '4px' }}>
                  {item.name}: {item.value}
                </Tag>
              ))}
            </div>
          </ChartCard>
        </Col>
      </Row>

      {/* Tables */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <ChartCard title="Đơn hàng gần đây" extra={<Button type="link">Xem tất cả</Button>}>
            <Table
              columns={orderColumns}
              dataSource={recentOrders}
              pagination={false}
              size="small"
            />
          </ChartCard>
        </Col>
        <Col xs={24} lg={10}>
          <ChartCard title="Sản phẩm sắp hết hàng" extra={<Button type="link">Xem tất cả</Button>}>
            <Table
              columns={stockColumns}
              dataSource={lowStockProducts}
              pagination={false}
              size="small"
            />
          </ChartCard>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
