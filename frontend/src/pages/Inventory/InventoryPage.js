import React, { useState } from 'react';
import { Table, Button, Space, Input, Select, Tag, Modal, Form, InputNumber, Typography, Row, Col, Card, Statistic, Progress } from 'antd';
import { SearchOutlined, PlusOutlined, MinusOutlined, InboxOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Title, Text } = Typography;
const { Option } = Select;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

// Mock data
const mockInventory = [
  {
    key: '1',
    productId: 'SP001',
    productName: 'iPhone 15 Pro Max',
    sku: 'IP15PM-256-BL',
    currentStock: 45,
    minStock: 10,
    maxStock: 100,
    location: 'A1-01',
    lastUpdated: '2024-01-15 10:30',
    status: 'normal',
  },
  {
    key: '2',
    productId: 'SP002',
    productName: 'Samsung Galaxy S24',
    sku: 'SGS24-512-WH',
    currentStock: 8,
    minStock: 15,
    maxStock: 80,
    location: 'A1-02',
    lastUpdated: '2024-01-15 09:15',
    status: 'low',
  },
  {
    key: '3',
    productId: 'SP003',
    productName: 'MacBook Pro M3',
    sku: 'MBP-M3-512-SG',
    currentStock: 2,
    minStock: 5,
    maxStock: 30,
    location: 'B2-05',
    lastUpdated: '2024-01-14 16:45',
    status: 'critical',
  },
];

const InventoryPage = () => {
  const [inventory, setInventory] = useState(mockInventory);
  const [loading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState(''); // 'in' or 'out'
  const [selectedItem, setSelectedItem] = useState(null);
  const [form] = Form.useForm();

  const columns = [
    {
      title: 'Mã SP',
      dataIndex: 'productId',
      key: 'productId',
      render: (text) => <Text code>{text}</Text>,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
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
      dataIndex: 'currentStock',
      key: 'currentStock',
      render: (stock, record) => {
        const percentage = (stock / record.maxStock) * 100;
        let status = 'normal';
        let color = '#52c41a';
        
        if (stock <= record.minStock) {
          status = stock === 0 ? 'exception' : 'active';
          color = stock === 0 ? '#ff4d4f' : '#faad14';
        }
        
        return (
          <div>
            <Text strong style={{ color }}>{stock}</Text>
            <Text type="secondary"> / {record.maxStock}</Text>
            <Progress 
              percent={percentage} 
              size="small" 
              status={status}
              showInfo={false}
              style={{ marginTop: 4 }}
            />
          </div>
        );
      },
    },
    {
      title: 'Vị trí',
      dataIndex: 'location',
      key: 'location',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          normal: { color: 'success', text: 'Bình thường', icon: <CheckCircleOutlined /> },
          low: { color: 'warning', text: 'Sắp hết', icon: <WarningOutlined /> },
          critical: { color: 'error', text: 'Nguy hiểm', icon: <WarningOutlined /> },
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
      title: 'Cập nhật cuối',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      render: (text) => <Text type="secondary">{text}</Text>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            size="small" 
            icon={<PlusOutlined />}
            onClick={() => handleStockIn(record)}
          >
            Nhập
          </Button>
          <Button 
            size="small" 
            icon={<MinusOutlined />}
            onClick={() => handleStockOut(record)}
          >
            Xuất
          </Button>
        </Space>
      ),
    },
  ];

  const handleStockIn = (item) => {
    setSelectedItem(item);
    setModalType('in');
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleStockOut = (item) => {
    setSelectedItem(item);
    setModalType('out');
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const { quantity } = values;
      
      setInventory(inventory.map(item => {
        if (item.key === selectedItem.key) {
          const newStock = modalType === 'in' 
            ? item.currentStock + quantity
            : item.currentStock - quantity;
          
          let newStatus = 'normal';
          if (newStock <= 0) newStatus = 'critical';
          else if (newStock <= item.minStock) newStatus = 'low';
          
          return {
            ...item,
            currentStock: Math.max(0, newStock),
            status: newStatus,
            lastUpdated: new Date().toLocaleString('vi-VN'),
          };
        }
        return item;
      }));
      
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchText.toLowerCase()) ||
                         item.productId.toLowerCase().includes(searchText.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(item => item.status === 'low').length;
  const criticalItems = inventory.filter(item => item.status === 'critical').length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.currentStock * 1000000), 0); // Mock price

  return (
    <div className="fade-in">
      <PageHeader>
        <div>
          <Title level={2} style={{ margin: 0 }}>Quản lý tồn kho</Title>
          <Text type="secondary">Theo dõi và quản lý tồn kho sản phẩm</Text>
        </div>
      </PageHeader>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng mặt hàng"
              value={totalItems}
              prefix={<InboxOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Sắp hết hàng"
              value={lowStockItems}
              prefix={<WarningOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Hết hàng"
              value={criticalItems}
              prefix={<WarningOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Giá trị tồn kho"
              value={totalValue}
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
              placeholder="Tìm kiếm sản phẩm..."
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
              <Option value="normal">Bình thường</Option>
              <Option value="low">Sắp hết</Option>
              <Option value="critical">Nguy hiểm</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredInventory}
          loading={loading}
          pagination={{
            total: filteredInventory.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} mặt hàng`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title={modalType === 'in' ? 'Nhập kho' : 'Xuất kho'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        okText={modalType === 'in' ? 'Nhập kho' : 'Xuất kho'}
        cancelText="Hủy"
      >
        {selectedItem && (
          <div style={{ marginBottom: 16 }}>
            <Text strong>Sản phẩm: </Text>
            <Text>{selectedItem.productName}</Text>
            <br />
            <Text strong>Tồn kho hiện tại: </Text>
            <Text>{selectedItem.currentStock}</Text>
          </div>
        )}
        
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng!' },
              { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0!' },
              ...(modalType === 'out' ? [{
                validator: (_, value) => {
                  if (value > selectedItem?.currentStock) {
                    return Promise.reject('Số lượng xuất không được vượt quá tồn kho!');
                  }
                  return Promise.resolve();
                }
              }] : [])
            ]}
          >
            <InputNumber
              placeholder="Nhập số lượng"
              style={{ width: '100%' }}
              min={1}
              max={modalType === 'out' ? selectedItem?.currentStock : undefined}
            />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Lý do"
            rules={[{ required: true, message: 'Vui lòng nhập lý do!' }]}
          >
            <Input.TextArea
              placeholder={modalType === 'in' ? 'Lý do nhập kho...' : 'Lý do xuất kho...'}
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InventoryPage;
