import React, { useState } from 'react';
import { Button, Popover, Typography, Tooltip } from 'antd';
import { BgColorsOutlined, CheckOutlined } from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';
import styled from 'styled-components';

const { Text } = Typography;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 16px;
  width: 200px;
`;

const ColorSwatch = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid ${props => props.selected ? '#fff' : 'transparent'};
  box-shadow: ${props => props.selected ? '0 0 0 2px #1890ff' : '0 2px 4px rgba(0,0,0,0.1)'};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }
`;

const predefinedColors = [
  { name: 'Blue', value: '#1890ff' },
  { name: 'Purple', value: '#722ed1' },
  { name: 'Cyan', value: '#13c2c2' },
  { name: 'Green', value: '#52c41a' },
  { name: 'Magenta', value: '#eb2f96' },
  { name: 'Red', value: '#f5222d' },
  { name: 'Orange', value: '#fa8c16' },
  { name: 'Yellow', value: '#fadb14' },
  { name: 'Lime', value: '#a0d911' },
  { name: 'Pink', value: '#ff85c0' },
  { name: 'Indigo', value: '#4c6ef5' },
  { name: 'Teal', value: '#20c997' },
];

const ColorPicker = () => {
  const { primaryColor, changePrimaryColor } = useTheme();
  const [visible, setVisible] = useState(false);

  const handleColorChange = (color) => {
    changePrimaryColor(color);
    setVisible(false);
  };

  const content = (
    <div>
      <Text strong style={{ display: 'block', marginBottom: 12 }}>
        Choose Theme Color
      </Text>
      <ColorGrid>
        {predefinedColors.map((color) => (
          <Tooltip key={color.value} title={color.name}>
            <ColorSwatch
              style={{ backgroundColor: color.value }}
              selected={primaryColor === color.value}
              onClick={() => handleColorChange(color.value)}
            >
              {primaryColor === color.value && (
                <CheckOutlined style={{ color: '#fff', fontSize: '14px' }} />
              )}
            </ColorSwatch>
          </Tooltip>
        ))}
      </ColorGrid>
    </div>
  );

  return (
    <Popover
      content={content}
      title={null}
      trigger="click"
      visible={visible}
      onVisibleChange={setVisible}
      placement="bottomRight"
    >
      <Tooltip title="Change Theme Color">
        <Button
          type="text"
          icon={<BgColorsOutlined />}
          style={{ 
            fontSize: '16px',
            color: primaryColor
          }}
        />
      </Tooltip>
    </Popover>
  );
};

export default ColorPicker;
