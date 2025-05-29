import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Divider, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, InboxOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import styled from 'styled-components';

const { Title, Text, Link } = Typography;

const LoginContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 400px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: none;
`;

const LogoSection = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const Logo = styled.div`
  font-size: 48px;
  color: #1890ff;
  margin-bottom: 16px;
`;

const WelcomeText = styled(Title)`
  color: #333;
  margin-bottom: 8px !important;
`;

const SubText = styled(Text)`
  color: #666;
  font-size: 14px;
`;

const StyledForm = styled(Form)`
  .ant-form-item {
    margin-bottom: 20px;
  }
  
  .ant-input-affix-wrapper {
    padding: 12px 16px;
    border-radius: 8px;
    border: 1px solid #d9d9d9;
    
    &:hover {
      border-color: #1890ff;
    }
    
    &:focus-within {
      border-color: #1890ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }
  }
`;

const LoginButton = styled(Button)`
  width: 100%;
  height: 48px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  border: none;
  
  &:hover {
    background: linear-gradient(135deg, #096dd9 0%, #0050b3 100%);
  }
`;

const DemoCredentials = styled.div`
  background: #f6f8fa;
  border: 1px solid #e1e4e8;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
`;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await login(values);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    // Auto-fill demo credentials
    const form = document.querySelector('form');
    if (form) {
      const emailInput = form.querySelector('input[type="email"]');
      const passwordInput = form.querySelector('input[type="password"]');
      
      if (emailInput) emailInput.value = 'admin@warehouse.com';
      if (passwordInput) passwordInput.value = 'admin123';
      
      // Trigger change events
      emailInput?.dispatchEvent(new Event('input', { bubbles: true }));
      passwordInput?.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <LogoSection>
          <Logo>
            <InboxOutlined />
          </Logo>
          <WelcomeText level={2}>Chào mừng trở lại!</WelcomeText>
          <SubText>Đăng nhập vào hệ thống quản lý kho hàng</SubText>
        </LogoSection>

        <DemoCredentials>
          <Text strong style={{ color: '#1890ff', display: 'block', marginBottom: '8px' }}>
            🎯 Tài khoản demo:
          </Text>
          <Text code>Email: admin@warehouse.com</Text>
          <br />
          <Text code>Mật khẩu: admin123</Text>
          <br />
          <Button 
            type="link" 
            size="small" 
            onClick={fillDemoCredentials}
            style={{ padding: '4px 0', height: 'auto', marginTop: '8px' }}
          >
            Điền tự động
          </Button>
        </DemoCredentials>

        <StyledForm
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Email"
              type="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mật khẩu"
            />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Checkbox>Ghi nhớ đăng nhập</Checkbox>
              <Link href="#" style={{ color: '#1890ff' }}>
                Quên mật khẩu?
              </Link>
            </div>
          </Form.Item>

          <Form.Item>
            <LoginButton
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              Đăng nhập
            </LoginButton>
          </Form.Item>
        </StyledForm>

        <Divider>hoặc</Divider>

        <div style={{ textAlign: 'center' }}>
          <Text>Chưa có tài khoản? </Text>
          <Link href="#" style={{ color: '#1890ff', fontWeight: 500 }}>
            Đăng ký ngay
          </Link>
        </div>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;
