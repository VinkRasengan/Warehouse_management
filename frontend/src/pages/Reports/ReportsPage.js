import React, { useState } from 'react';
import { Card, Row, Col, Select, DatePicker, Button, Typography, Statistic, Table } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { DownloadOutlined, PrinterOutlined, FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// Mock data
const salesData = [
  { month: 'T1', revenue: 120000000, orders: 45, profit: 24000000 },
  { month: 'T2', revenue: 150000000, orders: 52, profit: 30000000 },
  { month: 'T3', revenue: 180000000, orders: 68, profit: 36000000 },
  { month: 'T4', revenue: 165000000, orders: 61, profit: 33000000 },
  { month: 'T5', revenue: 200000000, orders: 75, profit: 40000000 },
  { month: 'T6', revenue: 220000000, orders: 82, profit: 44000000 },
];

const categoryData = [
  { name: 'Điện tử', value: 45, revenue: 180000000, color: '#1890ff' },
  { name: 'Thời trang', value: 25, revenue: 100000000, color: '#52c41a' },
  { name: 'Gia dụng', value: 20, revenue: 80000000, color: '#faad14' },
  { name: 'Sách', value: 10, revenue: 40000000, color: '#ff4d4f' },
];

const topProducts = [
  { rank: 1, name: 'iPhone 15 Pro Max', sold: 156, revenue: 4678440000 },
  { rank: 2, name: 'Samsung Galaxy S24', sold: 134, revenue: 3616660000 },
  { rank: 3, name: 'MacBook Pro M3', sold: 89, revenue: 4093110000 },
  { rank: 4, name: 'AirPods Pro 2', sold: 245, revenue: 1590050000 },
  { rank: 5, name: 'iPad Air M2', sold: 112, revenue: 2351200000 },
];

const ReportsPage = () => {
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState([moment().subtract(30, 'days'), moment()]);
  const [loading, setLoading] = useState(false);

  const handleExport = (format) => {
    setLoading(true);
    // Simulate export
    setTimeout(() => {
      setLoading(false);
      console.log(`Exporting ${reportType} report as ${format}`);
    }, 2000);
  };

  const renderSalesReport = () => (
    <div>
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={1035000000}
              valueStyle={{ color: '#52c41a' }}
              formatter={(value) => `${value.toLocaleString('vi-VN')} ₫`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={383}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Lợi nhuận"
              value={207000000}
              valueStyle={{ color: '#722ed1' }}
              formatter={(value) => `${value.toLocaleString('vi-VN')} ₫`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Đơn giá TB"
              value={2703000}
              valueStyle={{ color: '#faad14' }}
              formatter={(value) => `${value.toLocaleString('vi-VN')} ₫`}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="Biểu đồ doanh thu theo tháng">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'revenue' ? `${value.toLocaleString('vi-VN')} ₫` : value,
                  name === 'revenue' ? 'Doanh thu' : 'Đơn hàng'
                ]} />
                <Area type="monotone" dataKey="revenue" stroke="#1890ff" fill="#1890ff" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Phân bố theo danh mục">
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
                <Tooltip formatter={(value) => [`${value}%`, 'Tỷ lệ']} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderInventoryReport = () => (
    <div>
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng sản phẩm"
              value={1234}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Giá trị tồn kho"
              value={2500000000}
              valueStyle={{ color: '#52c41a' }}
              formatter={(value) => `${value.toLocaleString('vi-VN')} ₫`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Sắp hết hàng"
              value={23}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Hết hàng"
              value={5}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Top sản phẩm bán chạy">
        <Table
          columns={[
            { title: 'Hạng', dataIndex: 'rank', key: 'rank', width: 60 },
            { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name' },
            { title: 'Đã bán', dataIndex: 'sold', key: 'sold', render: (value) => `${value} sản phẩm` },
            { 
              title: 'Doanh thu', 
              dataIndex: 'revenue', 
              key: 'revenue',
              render: (value) => `${value.toLocaleString('vi-VN')} ₫`
            },
          ]}
          dataSource={topProducts.map(item => ({ ...item, key: item.rank }))}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );

  const renderCustomerReport = () => (
    <div>
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng khách hàng"
              value={2456}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Khách hàng mới"
              value={156}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Khách hàng VIP"
              value={89}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tỷ lệ quay lại"
              value={68.5}
              valueStyle={{ color: '#722ed1' }}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      <Card title="Biểu đồ tăng trưởng khách hàng">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="orders" stroke="#1890ff" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );

  const renderReportContent = () => {
    switch (reportType) {
      case 'sales':
        return renderSalesReport();
      case 'inventory':
        return renderInventoryReport();
      case 'customer':
        return renderCustomerReport();
      default:
        return renderSalesReport();
    }
  };

  return (
    <div className="fade-in">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 24,
        padding: 24,
        background: 'white',
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
      }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Báo cáo & Thống kê</Title>
          <Text type="secondary">Phân tích dữ liệu kinh doanh và hiệu suất</Text>
        </div>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={6}>
            <Select
              placeholder="Loại báo cáo"
              value={reportType}
              onChange={setReportType}
              style={{ width: '100%' }}
            >
              <Option value="sales">Báo cáo bán hàng</Option>
              <Option value="inventory">Báo cáo tồn kho</Option>
              <Option value="customer">Báo cáo khách hàng</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
            />
          </Col>
          <Col xs={24} sm={10}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button 
                icon={<FileExcelOutlined />}
                onClick={() => handleExport('excel')}
                loading={loading}
              >
                Excel
              </Button>
              <Button 
                icon={<FilePdfOutlined />}
                onClick={() => handleExport('pdf')}
                loading={loading}
              >
                PDF
              </Button>
              <Button 
                icon={<PrinterOutlined />}
                onClick={() => window.print()}
              >
                In
              </Button>
              <Button 
                type="primary"
                icon={<DownloadOutlined />}
                onClick={() => handleExport('csv')}
                loading={loading}
              >
                Tải xuống
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {renderReportContent()}
    </div>
  );
};

export default ReportsPage;
