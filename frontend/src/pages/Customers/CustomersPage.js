import React, { useState } from 'react';
import { Table, Button, Space, Input, Select, Tag, Modal, Form, Typography, Row, Col, Card, Statistic, Avatar } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, EyeOutlined, UserOutlined, CrownOutlined, GiftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const mockCustomers = [
  {
    key: '1',
    id: 'KH001',
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    phone: '0901234567',
    address: '123 Nguyễn Văn Linh, Q.7, TP.HCM',
    loyaltyPoints: 1250,
    loyaltyTier: 'Silver',
    totalOrders: 15,
    totalSpent: 45000000,
    lastOrderDate: '2024-01-15',
    status: 'active',
    joinDate: '2023-06-15',
  },
  {
    key: '2',
    id: 'KH002',
    name: 'Trần Thị B',
    email: 'tranthib@email.com',
    phone: '0907654321',
    address: '456 Lê Văn Việt, Q.9, TP.HCM',
    loyaltyPoints: 2800,
    loyaltyTier: 'Gold',
    totalOrders: 28,
    totalSpent: 89000000,
    lastOrderDate: '2024-01-14',
    status: 'active',
    joinDate: '2023-03-20',
  },
  {
    key: '3',
    id: 'KH003',
    name: 'Lê Văn C',
    email: 'levanc@email.com',
    phone: '0912345678',
    address: '789 Võ Văn Tần, Q.3, TP.HCM',
    loyaltyPoints: 5200,
    loyaltyTier: 'Platinum',
    totalOrders: 42,
    totalSpent: 156000000,
    lastOrderDate: '2024-01-13',
    status: 'active',
    joinDate: '2022-11-10',
  },
];

const CustomersPage = () => {
  const [customers, setCustomers] = useState(mockCustomers);
  const [loading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [form] = Form.useForm();

  const getTierColor = (tier) => {
    const colors = {
      Bronze: '#cd7f32',
      Silver: '#c0c0c0',
      Gold: '#ffd700',
      Platinum: '#e5e4e2',
    };
    return colors[tier] || '#1890ff';
  };

  const getTierIcon = (tier) => {
    if (tier === 'Platinum' || tier === 'Gold') {
      return <CrownOutlined />;
    }
    return <GiftOutlined />;
  };

  const columns = [
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            size={40} 
            icon={<UserOutlined />} 
            style={{ marginRight: 12, backgroundColor: getTierColor(record.loyaltyTier) }}
          />
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text code>{record.id}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      render: (_, record) => (
        <div>
          <Text>{record.email}</Text>
          <br />
          <Text type="secondary">{record.phone}</Text>
        </div>
      ),
    },
    {
      title: 'Hạng thành viên',
      dataIndex: 'loyaltyTier',
      key: 'loyaltyTier',
      render: (tier, record) => (
        <div>
          <Tag 
            color={getTierColor(tier)} 
            icon={getTierIcon(tier)}
            style={{ color: tier === 'Silver' ? '#333' : '#fff' }}
          >
            {tier}
          </Tag>
          <br />
          <Text type="secondary">{record.loyaltyPoints} điểm</Text>
        </div>
      ),
    },
    {
      title: 'Đơn hàng',
      dataIndex: 'totalOrders',
      key: 'totalOrders',
      render: (orders, record) => (
        <div>
          <Text strong>{orders} đơn</Text>
          <br />
          <Text type="secondary">Gần nhất: {record.lastOrderDate}</Text>
        </div>
      ),
    },
    {
      title: 'Tổng chi tiêu',
      dataIndex: 'totalSpent',
      key: 'totalSpent',
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
        const config = {
          active: { color: 'success', text: 'Hoạt động' },
          inactive: { color: 'default', text: 'Không hoạt động' },
          blocked: { color: 'error', text: 'Bị khóa' },
        };
        return <Tag color={config[status].color}>{config[status].text}</Tag>;
      },
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
            onClick={() => handleView(record)}
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

  const handleView = (customer) => {
    Modal.info({
      title: 'Chi tiết khách hàng',
      content: (
        <div>
          <p><strong>Mã KH:</strong> {customer.id}</p>
          <p><strong>Tên:</strong> {customer.name}</p>
          <p><strong>Email:</strong> {customer.email}</p>
          <p><strong>Điện thoại:</strong> {customer.phone}</p>
          <p><strong>Địa chỉ:</strong> {customer.address}</p>
          <p><strong>Hạng thành viên:</strong> {customer.loyaltyTier}</p>
          <p><strong>Điểm tích lũy:</strong> {customer.loyaltyPoints}</p>
          <p><strong>Tổng đơn hàng:</strong> {customer.totalOrders}</p>
          <p><strong>Tổng chi tiêu:</strong> {customer.totalSpent.toLocaleString('vi-VN')} ₫</p>
          <p><strong>Ngày tham gia:</strong> {customer.joinDate}</p>
        </div>
      ),
      width: 600,
    });
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    form.setFieldsValue(customer);
    setIsModalVisible(true);
  };

  const handleAdd = () => {
    setEditingCustomer(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingCustomer) {
        setCustomers(customers.map(c => 
          c.key === editingCustomer.key 
            ? { ...c, ...values }
            : c
        ));
      } else {
        const newCustomer = {
          key: Date.now().toString(),
          id: `KH${String(customers.length + 1).padStart(3, '0')}`,
          ...values,
          loyaltyPoints: 0,
          loyaltyTier: 'Bronze',
          totalOrders: 0,
          totalSpent: 0,
          joinDate: new Date().toISOString().split('T')[0],
        };
        setCustomers([...customers, newCustomer]);
      }
      
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchText.toLowerCase()) ||
                         customer.phone.includes(searchText) ||
                         customer.id.toLowerCase().includes(searchText.toLowerCase());
    const matchesTier = !tierFilter || customer.loyaltyTier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const vipCustomers = customers.filter(c => c.loyaltyTier === 'Gold' || c.loyaltyTier === 'Platinum').length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);

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
          <Title level={2} style={{ margin: 0 }}>Quản lý khách hàng</Title>
          <Text type="secondary">Quản lý thông tin và chăm sóc khách hàng</Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large"
          onClick={handleAdd}
          className="btn-gradient"
        >
          Thêm khách hàng
        </Button>
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng khách hàng"
              value={totalCustomers}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={activeCustomers}
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Khách hàng VIP"
              value={vipCustomers}
              prefix={<CrownOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
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
              placeholder="Tìm kiếm khách hàng..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={6}>
            <Select
              placeholder="Lọc theo hạng"
              value={tierFilter}
              onChange={setTierFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="Bronze">Bronze</Option>
              <Option value="Silver">Silver</Option>
              <Option value="Gold">Gold</Option>
              <Option value="Platinum">Platinum</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredCustomers}
          loading={loading}
          pagination={{
            total: filteredCustomers.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} khách hàng`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title={editingCustomer ? 'Sửa thông tin khách hàng' : 'Thêm khách hàng mới'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText={editingCustomer ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 'active' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Họ và tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
              >
                <Input placeholder="Nhập họ và tên" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại!' },
                  { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
                ]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input placeholder="Nhập địa chỉ email" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
          >
            <Input.TextArea
              placeholder="Nhập địa chỉ"
              rows={2}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
          >
            <Select>
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Không hoạt động</Option>
              <Option value="blocked">Bị khóa</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomersPage;
