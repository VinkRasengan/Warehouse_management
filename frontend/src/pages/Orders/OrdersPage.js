import React, { useState } from 'react';
import { Table, Button, Space, Input, Select, Tag, Modal, Typography, Row, Col, Card, Statistic, Steps } from 'antd';
import { SearchOutlined, EyeOutlined, EditOutlined, ShoppingCartOutlined, ClockCircleOutlined, CheckCircleOutlined, TruckOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { Step } = Steps;

const mockOrders = [
  {
    key: '1',
    orderId: 'DH001',
    customerName: 'Nguyễn Văn A',
    customerPhone: '0901234567',
    items: [
      { name: 'iPhone 15 Pro', quantity: 1, price: 29990000 },
      { name: 'AirPods Pro', quantity: 1, price: 6490000 }
    ],
    totalAmount: 36480000,
    status: 'pending',
    paymentStatus: 'unpaid',
    createdAt: '2024-01-15 10:30',
    shippingAddress: '123 Nguyễn Văn Linh, Q.7, TP.HCM',
  },
  {
    key: '2',
    orderId: 'DH002',
    customerName: 'Trần Thị B',
    customerPhone: '0907654321',
    items: [
      { name: 'Samsung Galaxy S24', quantity: 2, price: 26990000 }
    ],
    totalAmount: 53980000,
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: '2024-01-15 09:15',
    shippingAddress: '456 Lê Văn Việt, Q.9, TP.HCM',
  },
  {
    key: '3',
    orderId: 'DH003',
    customerName: 'Lê Văn C',
    customerPhone: '0912345678',
    items: [
      { name: 'MacBook Pro M3', quantity: 1, price: 45990000 }
    ],
    totalAmount: 45990000,
    status: 'shipping',
    paymentStatus: 'paid',
    createdAt: '2024-01-14 16:45',
    shippingAddress: '789 Võ Văn Tần, Q.3, TP.HCM',
  },
];

const OrdersPage = () => {
  const [orders, setOrders] = useState(mockOrders);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (text) => <Text code strong>{text}</Text>,
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_, record) => (
        <div>
          <Text strong>{record.customerName}</Text>
          <br />
          <Text type="secondary">{record.customerPhone}</Text>
        </div>
      ),
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'items',
      key: 'items',
      render: (items) => (
        <div>
          {items.slice(0, 2).map((item, index) => (
            <div key={index}>
              <Text>{item.name} x{item.quantity}</Text>
            </div>
          ))}
          {items.length > 2 && (
            <Text type="secondary">+{items.length - 2} sản phẩm khác</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => (
        <Text strong style={{ color: '#52c41a' }}>
          {amount.toLocaleString('vi-VN')} ₫
        </Text>
      ),
    },
    {
      title: 'Trạng thái đơn hàng',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          pending: { color: 'warning', text: 'Chờ xử lý', icon: <ClockCircleOutlined /> },
          confirmed: { color: 'processing', text: 'Đã xác nhận', icon: <CheckCircleOutlined /> },
          shipping: { color: 'blue', text: 'Đang giao', icon: <TruckOutlined /> },
          completed: { color: 'success', text: 'Hoàn thành', icon: <CheckCircleOutlined /> },
          cancelled: { color: 'error', text: 'Đã hủy', icon: <ClockCircleOutlined /> },
        };
        const config = statusConfig[status];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status) => {
        const config = {
          paid: { color: 'success', text: 'Đã thanh toán' },
          unpaid: { color: 'error', text: 'Chưa thanh toán' },
          partial: { color: 'warning', text: 'Thanh toán 1 phần' },
        };
        return <Tag color={config[status].color}>{config[status].text}</Tag>;
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => <Text type="secondary">{text}</Text>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => handleViewDetail(record)}
          />
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEdit(record)}
          />
        </Space>
      ),
    },
  ];

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setIsDetailModalVisible(true);
  };

  const handleEdit = (order) => {
    // Handle edit order
    console.log('Edit order:', order);
  };

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.orderId === orderId 
        ? { ...order, status: newStatus }
        : order
    ));
  };

  const getOrderSteps = (status) => {
    const steps = [
      { title: 'Chờ xử lý', status: 'pending' },
      { title: 'Đã xác nhận', status: 'confirmed' },
      { title: 'Đang giao', status: 'shipping' },
      { title: 'Hoàn thành', status: 'completed' },
    ];

    const currentIndex = steps.findIndex(step => step.status === status);
    
    return steps.map((step, index) => ({
      ...step,
      status: index <= currentIndex ? 'finish' : 'wait'
    }));
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderId.toLowerCase().includes(searchText.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
                         order.customerPhone.includes(searchText);
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const completedOrders = orders.filter(order => order.status === 'completed').length;
  const totalRevenue = orders
    .filter(order => order.status === 'completed')
    .reduce((sum, order) => sum + order.totalAmount, 0);

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
          <Title level={2} style={{ margin: 0 }}>Quản lý đơn hàng</Title>
          <Text type="secondary">Theo dõi và xử lý đơn hàng khách hàng</Text>
        </div>
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={totalOrders}
              prefix={<ShoppingCartOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Chờ xử lý"
              value={pendingOrders}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Hoàn thành"
              value={completedOrders}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Doanh thu"
              value={totalRevenue}
              valueStyle={{ color: '#52c41a' }}
              formatter={(value) => `${value.toLocaleString('vi-VN')} ₫`}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8}>
            <Input
              placeholder="Tìm kiếm đơn hàng..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={6}>
            <Select
              placeholder="Lọc theo trạng thái"
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="pending">Chờ xử lý</Option>
              <Option value="confirmed">Đã xác nhận</Option>
              <Option value="shipping">Đang giao</Option>
              <Option value="completed">Hoàn thành</Option>
              <Option value="cancelled">Đã hủy</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredOrders}
          loading={loading}
          pagination={{
            total: filteredOrders.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} đơn hàng`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title="Chi tiết đơn hàng"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>,
          <Button 
            key="edit" 
            type="primary"
            onClick={() => {
              setIsDetailModalVisible(false);
              handleEdit(selectedOrder);
            }}
          >
            Chỉnh sửa
          </Button>,
        ]}
      >
        {selectedOrder && (
          <div>
            <Row gutter={[24, 24]}>
              <Col span={12}>
                <Title level={4}>Thông tin đơn hàng</Title>
                <p><strong>Mã đơn hàng:</strong> {selectedOrder.orderId}</p>
                <p><strong>Ngày tạo:</strong> {selectedOrder.createdAt}</p>
                <p><strong>Tổng tiền:</strong> {selectedOrder.totalAmount.toLocaleString('vi-VN')} ₫</p>
              </Col>
              <Col span={12}>
                <Title level={4}>Thông tin khách hàng</Title>
                <p><strong>Tên:</strong> {selectedOrder.customerName}</p>
                <p><strong>Điện thoại:</strong> {selectedOrder.customerPhone}</p>
                <p><strong>Địa chỉ:</strong> {selectedOrder.shippingAddress}</p>
              </Col>
            </Row>

            <Title level={4}>Sản phẩm</Title>
            <Table
              size="small"
              columns={[
                { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name' },
                { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
                { 
                  title: 'Đơn giá', 
                  dataIndex: 'price', 
                  key: 'price',
                  render: (price) => `${price.toLocaleString('vi-VN')} ₫`
                },
                { 
                  title: 'Thành tiền', 
                  key: 'total',
                  render: (_, record) => `${(record.price * record.quantity).toLocaleString('vi-VN')} ₫`
                },
              ]}
              dataSource={selectedOrder.items.map((item, index) => ({ ...item, key: index }))}
              pagination={false}
            />

            <Title level={4} style={{ marginTop: 24 }}>Trạng thái đơn hàng</Title>
            <Steps current={getOrderSteps(selectedOrder.status).findIndex(step => step.status === 'wait') - 1}>
              {getOrderSteps(selectedOrder.status).map((step, index) => (
                <Step key={index} title={step.title} />
              ))}
            </Steps>

            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Space>
                {selectedOrder.status === 'pending' && (
                  <Button 
                    type="primary" 
                    onClick={() => handleStatusChange(selectedOrder.orderId, 'confirmed')}
                  >
                    Xác nhận đơn hàng
                  </Button>
                )}
                {selectedOrder.status === 'confirmed' && (
                  <Button 
                    type="primary" 
                    onClick={() => handleStatusChange(selectedOrder.orderId, 'shipping')}
                  >
                    Bắt đầu giao hàng
                  </Button>
                )}
                {selectedOrder.status === 'shipping' && (
                  <Button 
                    type="primary" 
                    onClick={() => handleStatusChange(selectedOrder.orderId, 'completed')}
                  >
                    Hoàn thành đơn hàng
                  </Button>
                )}
                <Button danger>Hủy đơn hàng</Button>
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrdersPage;
