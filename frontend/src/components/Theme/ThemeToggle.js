import React from 'react';
import { Button, Tooltip } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';
import styled from 'styled-components';

const StyledButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const ThemeToggle = ({ size = 'middle' }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <Tooltip title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
      <StyledButton
        type="text"
        icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
        onClick={toggleTheme}
        size={size}
        style={{ 
          fontSize: size === 'large' ? '18px' : '16px',
          color: isDarkMode ? '#fadb14' : '#1890ff'
        }}
      />
    </Tooltip>
  );
};

export default ThemeToggle;
