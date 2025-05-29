import React, { useState } from 'react';
import { Card, Form, Input, Button, Switch, Select, Typography, Row, Col, Divider, Upload, Avatar, message } from 'antd';
import { UserOutlined, UploadOutlined, SaveOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

const SettingsPage = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSave = async (values) => {
    setLoading(true);
    try {
      await updateProfile(values);
      message.success('Cài đặt đã được lưu thành công!');
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu cài đặt!');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (info) => {
    if (info.file.status === 'done') {
      message.success('Tải ảnh đại diện thành công!');
    } else if (info.file.status === 'error') {
      message.error('Tải ảnh đại diện thất bại!');
    }
  };

  return (
    <div className="fade-in">
      <div style={{ 
        marginBottom: 24,
        padding: 24,
        background: 'white',
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
      }}>
        <Title level={2} style={{ margin: 0 }}>Cài đặt hệ thống</Title>
        <Text type="secondary">Quản lý thông tin cá nhân và cài đặt ứng dụng</Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card title="Thông tin cá nhân" style={{ marginBottom: 24 }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar 
                size={80} 
                icon={<UserOutlined />} 
                src={user?.avatar}
                style={{ marginBottom: 16 }}
              />
              <br />
              <Upload
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleAvatarChange}
              >
                <Button icon={<UploadOutlined />} size="small">
                  Thay đổi ảnh
                </Button>
              </Upload>
            </div>
            
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                name: user?.name || '',
                email: user?.email || '',
                phone: '',
                position: user?.role || '',
              }}
              onFinish={handleSave}
            >
              <Form.Item
                name="name"
                label="Họ và tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
              >
                <Input placeholder="Nhập họ và tên" />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' }
                ]}
              >
                <Input placeholder="Nhập địa chỉ email" disabled />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
                ]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>

              <Form.Item
                name="position"
                label="Chức vụ"
              >
                <Select placeholder="Chọn chức vụ">
                  <Option value="admin">Quản trị viên</Option>
                  <Option value="manager">Quản lý</Option>
                  <Option value="staff">Nhân viên</Option>
                </Select>
              </Form.Item>

              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<SaveOutlined />}
                block
              >
                Lưu thông tin
              </Button>
            </Form>
          </Card>

          <Card title="Đổi mật khẩu">
            <Form layout="vertical">
              <Form.Item
                name="currentPassword"
                label="Mật khẩu hiện tại"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
              >
                <Input.Password placeholder="Nhập mật khẩu hiện tại" />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="Mật khẩu mới"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                  { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                ]}
              >
                <Input.Password placeholder="Nhập mật khẩu mới" />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Xác nhận mật khẩu mới" />
              </Form.Item>

              <Button type="primary" block>
                Đổi mật khẩu
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card title="Cài đặt ứng dụng" style={{ marginBottom: 24 }}>
            <Form layout="vertical">
              <Title level={4}>Thông báo</Title>
              <Row gutter={[24, 16]}>
                <Col span={12}>
                  <Form.Item label="Email thông báo">
                    <Switch defaultChecked />
                    <br />
                    <Text type="secondary">Nhận thông báo qua email</Text>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Thông báo đơn hàng mới">
                    <Switch defaultChecked />
                    <br />
                    <Text type="secondary">Thông báo khi có đơn hàng mới</Text>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Cảnh báo tồn kho">
                    <Switch defaultChecked />
                    <br />
                    <Text type="secondary">Cảnh báo khi sản phẩm sắp hết</Text>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Báo cáo hàng tuần">
                    <Switch />
                    <br />
                    <Text type="secondary">Gửi báo cáo tự động hàng tuần</Text>
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Title level={4}>Hiển thị</Title>
              <Row gutter={[24, 16]}>
                <Col span={12}>
                  <Form.Item label="Ngôn ngữ">
                    <Select defaultValue="vi" style={{ width: '100%' }}>
                      <Option value="vi">Tiếng Việt</Option>
                      <Option value="en">English</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Múi giờ">
                    <Select defaultValue="asia/ho_chi_minh" style={{ width: '100%' }}>
                      <Option value="asia/ho_chi_minh">GMT+7 (Hồ Chí Minh)</Option>
                      <Option value="utc">UTC</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Định dạng ngày">
                    <Select defaultValue="dd/mm/yyyy" style={{ width: '100%' }}>
                      <Option value="dd/mm/yyyy">DD/MM/YYYY</Option>
                      <Option value="mm/dd/yyyy">MM/DD/YYYY</Option>
                      <Option value="yyyy-mm-dd">YYYY-MM-DD</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Đơn vị tiền tệ">
                    <Select defaultValue="vnd" style={{ width: '100%' }}>
                      <Option value="vnd">VND (₫)</Option>
                      <Option value="usd">USD ($)</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Title level={4}>Bảo mật</Title>
              <Row gutter={[24, 16]}>
                <Col span={12}>
                  <Form.Item label="Xác thực 2 bước">
                    <Switch />
                    <br />
                    <Text type="secondary">Bảo mật tài khoản với xác thực 2 bước</Text>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Tự động đăng xuất">
                    <Switch defaultChecked />
                    <br />
                    <Text type="secondary">Đăng xuất sau 30 phút không hoạt động</Text>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Ghi nhớ phiên đăng nhập">
                    <Switch defaultChecked />
                    <br />
                    <Text type="secondary">Ghi nhớ đăng nhập trên thiết bị này</Text>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Thông báo đăng nhập">
                    <Switch defaultChecked />
                    <br />
                    <Text type="secondary">Thông báo khi có đăng nhập mới</Text>
                  </Form.Item>
                </Col>
              </Row>

              <div style={{ textAlign: 'right', marginTop: 24 }}>
                <Button type="primary" size="large" icon={<SaveOutlined />}>
                  Lưu tất cả cài đặt
                </Button>
              </div>
            </Form>
          </Card>

          <Card title="Thông tin hệ thống">
            <Row gutter={[24, 16]}>
              <Col span={8}>
                <Text strong>Phiên bản:</Text>
                <br />
                <Text>v1.0.0</Text>
              </Col>
              <Col span={8}>
                <Text strong>Cập nhật cuối:</Text>
                <br />
                <Text>15/01/2024</Text>
              </Col>
              <Col span={8}>
                <Text strong>Hỗ trợ:</Text>
                <br />
                <Text>support@warehouse.com</Text>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SettingsPage;
