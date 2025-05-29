import React, { useState } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Input, 
  Select, 
  Tag, 
  Modal, 
  Form, 
  InputNumber, 
  Upload, 
  Typography,
  Row,
  Col,
  Card,
  Statistic
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  ShoppingOutlined,
  InboxOutlined,
  DollarOutlined
} from '@ant-design/icons';
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

const FilterSection = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
`;

const StatsRow = styled(Row)`
  margin-bottom: 24px;
`;

// Mock data
const mockProducts = [
  {
    key: '1',
    id: 'SP001',
    name: 'iPhone 15 Pro Max',
    category: 'Điện tử',
    price: 29990000,
    stock: 45,
    status: 'active',
    image: 'https://via.placeholder.com/50',
    description: 'iPhone 15 Pro Max 256GB',
    createdAt: '2024-01-15',
  },
  {
    key: '2',
    id: 'SP002',
    name: 'Samsung Galaxy S24 Ultra',
    category: 'Điện tử',
    price: 26990000,
    stock: 32,
    status: 'active',
    image: 'https://via.placeholder.com/50',
    description: 'Samsung Galaxy S24 Ultra 512GB',
    createdAt: '2024-01-14',
  },
  {
    key: '3',
    id: 'SP003',
    name: 'MacBook Pro M3',
    category: 'Máy tính',
    price: 45990000,
    stock: 12,
    status: 'active',
    image: 'https://via.placeholder.com/50',
    description: 'MacBook Pro 14" M3 512GB',
    createdAt: '2024-01-13',
  },
  {
    key: '4',
    id: 'SP004',
    name: 'AirPods Pro 2',
    category: 'Phụ kiện',
    price: 6490000,
    stock: 0,
    status: 'out_of_stock',
    image: 'https://via.placeholder.com/50',
    description: 'AirPods Pro 2nd Generation',
    createdAt: '2024-01-12',
  },
];

const ProductsPage = () => {
  const [products, setProducts] = useState(mockProducts);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();

  const categories = ['Điện tử', 'Máy tính', 'Phụ kiện', 'Thời trang', 'Gia dụng'];

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      key: 'image',
      width: 80,
      render: (image) => (
        <img 
          src={image} 
          alt="Product" 
          style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8 }}
        />
      ),
    },
    {
      title: 'Mã SP',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <Text code>{text}</Text>,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: 'Giá bán',
      dataIndex: 'price',
      key: 'price',
      render: (price) => (
        <Text strong style={{ color: '#52c41a' }}>
          {price.toLocaleString('vi-VN')} ₫
        </Text>
      ),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => (
        <Text style={{ color: stock > 0 ? '#52c41a' : '#ff4d4f' }}>
          {stock}
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          active: { color: 'success', text: 'Đang bán' },
          inactive: { color: 'default', text: 'Ngừng bán' },
          out_of_stock: { color: 'error', text: 'Hết hàng' },
        };
        const config = statusConfig[status];
        return <Tag color={config.color}>{config.text}</Tag>;
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
          <Button 
            type="text" 
            icon={<DeleteOutlined />} 
            size="small" 
            danger
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  const handleView = (product) => {
    Modal.info({
      title: 'Chi tiết sản phẩm',
      content: (
        <div>
          <p><strong>Mã:</strong> {product.id}</p>
          <p><strong>Tên:</strong> {product.name}</p>
          <p><strong>Danh mục:</strong> {product.category}</p>
          <p><strong>Giá:</strong> {product.price.toLocaleString('vi-VN')} ₫</p>
          <p><strong>Tồn kho:</strong> {product.stock}</p>
          <p><strong>Mô tả:</strong> {product.description}</p>
        </div>
      ),
      width: 600,
    });
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    form.setFieldsValue(product);
    setIsModalVisible(true);
  };

  const handleDelete = (product) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`,
      onOk: () => {
        setProducts(products.filter(p => p.key !== product.key));
      },
    });
  };

  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingProduct) {
        // Update existing product
        setProducts(products.map(p => 
          p.key === editingProduct.key 
            ? { ...p, ...values }
            : p
        ));
      } else {
        // Add new product
        const newProduct = {
          key: Date.now().toString(),
          id: `SP${String(products.length + 1).padStart(3, '0')}`,
          ...values,
          createdAt: new Date().toISOString().split('T')[0],
        };
        setProducts([...products, newProduct]);
      }
      
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         product.id.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalProducts = products.length;
  const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);
  const lowStockProducts = products.filter(product => product.stock < 10).length;

  return (
    <div className="fade-in">
      <PageHeader>
        <div>
          <Title level={2} style={{ margin: 0 }}>Quản lý sản phẩm</Title>
          <Text type="secondary">Quản lý thông tin sản phẩm trong kho</Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large"
          onClick={handleAdd}
          className="btn-gradient"
        >
          Thêm sản phẩm
        </Button>
      </PageHeader>

      <StatsRow gutter={[24, 24]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng sản phẩm"
              value={totalProducts}
              prefix={<ShoppingOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Giá trị tồn kho"
              value={totalValue}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
              formatter={(value) => `${value.toLocaleString('vi-VN')} ₫`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Sản phẩm sắp hết"
              value={lowStockProducts}
              prefix={<InboxOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </StatsRow>

      <FilterSection>
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
              placeholder="Chọn danh mục"
              value={selectedCategory}
              onChange={setSelectedCategory}
              allowClear
              style={{ width: '100%' }}
            >
              {categories.map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={4}>
            <Button icon={<UploadOutlined />}>
              Import Excel
            </Button>
          </Col>
        </Row>
      </FilterSection>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredProducts}
          loading={loading}
          pagination={{
            total: filteredProducts.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} sản phẩm`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title={editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText={editingProduct ? 'Cập nhật' : 'Thêm mới'}
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
                label="Tên sản phẩm"
                rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
              >
                <Input placeholder="Nhập tên sản phẩm" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Danh mục"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
              >
                <Select placeholder="Chọn danh mục">
                  {categories.map(category => (
                    <Option key={category} value={category}>{category}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="price"
                label="Giá bán"
                rules={[{ required: true, message: 'Vui lòng nhập giá bán!' }]}
              >
                <InputNumber
                  placeholder="Nhập giá bán"
                  style={{ width: '100%' }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  addonAfter="₫"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="stock"
                label="Số lượng tồn kho"
                rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
              >
                <InputNumber
                  placeholder="Nhập số lượng"
                  style={{ width: '100%' }}
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô tả sản phẩm"
          >
            <Input.TextArea
              placeholder="Nhập mô tả sản phẩm"
              rows={3}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
          >
            <Select>
              <Option value="active">Đang bán</Option>
              <Option value="inactive">Ngừng bán</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="image"
            label="Hình ảnh sản phẩm"
          >
            <Upload
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => false}
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Tải lên</div>
              </div>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductsPage;
