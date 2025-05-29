import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
`;

const LoadingContent = styled.div`
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
`;

const LoadingText = styled.div`
  margin-top: 16px;
  font-size: 16px;
  color: #666;
  font-weight: 500;
`;

const antIcon = (
  <LoadingOutlined
    style={{
      fontSize: 32,
      color: '#1890ff',
    }}
    spin
  />
);

const LoadingSpinner = ({ text = 'Đang tải...', size = 'large' }) => {
  if (size === 'small') {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <Spin indicator={antIcon} />
      </div>
    );
  }

  return (
    <LoadingContainer>
      <LoadingContent>
        <Spin indicator={antIcon} size="large" />
        <LoadingText>{text}</LoadingText>
      </LoadingContent>
    </LoadingContainer>
  );
};

export default LoadingSpinner;
