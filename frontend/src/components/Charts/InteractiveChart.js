import React, { useState, useRef, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Brush
} from 'recharts';
import { Card, Select, Button, Space, Tooltip as AntTooltip, Switch } from 'antd';
import {
  DownloadOutlined,
  FullscreenOutlined,
  SettingOutlined,
  ZoomInOutlined,
  ZoomOutOutlined
} from '@ant-design/icons';
import html2canvas from 'html2canvas';

const { Option } = Select;

const CHART_TYPES = {
  LINE: 'line',
  AREA: 'area',
  BAR: 'bar',
  PIE: 'pie'
};

const COLORS = [
  '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
  '#13c2c2', '#eb2f96', '#fa8c16', '#a0d911', '#2f54eb'
];

const InteractiveChart = ({
  data = [],
  title,
  type = CHART_TYPES.LINE,
  xAxisKey = 'name',
  yAxisKeys = ['value'],
  colors = COLORS,
  height = 400,
  showBrush = false,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  allowTypeChange = true,
  allowExport = true,
  allowFullscreen = true,
  customTooltip = null,
  onDataPointClick = null,
  referenceLines = [],
  formatters = {}
}) => {
  const [chartType, setChartType] = useState(type);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const chartRef = useRef(null);

  // Handle chart export
  const handleExport = async (format = 'png') => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2
      });

      if (format === 'png') {
        const link = document.createElement('a');
        link.download = `${title || 'chart'}.png`;
        link.href = canvas.toDataURL();
        link.click();
      } else if (format === 'jpg') {
        const link = document.createElement('a');
        link.download = `${title || 'chart'}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.click();
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Handle fullscreen toggle
  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    if (customTooltip) {
      return customTooltip({ active, payload, label });
    }

    return (
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ margin: '4px 0', color: entry.color }}>
            {entry.name}: {formatters[entry.dataKey] ? 
              formatters[entry.dataKey](entry.value) : 
              entry.value
            }
          </p>
        ))}
      </div>
    );
  };

  // Render chart based on type
  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    const handleClick = (data, index) => {
      if (onDataPointClick) {
        onDataPointClick(data, index);
      }
    };

    switch (chartType) {
      case CHART_TYPES.LINE:
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            {yAxisKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6, onClick: handleClick }}
              />
            ))}
            {referenceLines.map((line, index) => (
              <ReferenceLine
                key={index}
                y={line.value}
                stroke={line.color || '#ff0000'}
                strokeDasharray="5 5"
                label={line.label}
              />
            ))}
            {showBrush && <Brush dataKey={xAxisKey} height={30} />}
          </LineChart>
        );

      case CHART_TYPES.AREA:
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            {yAxisKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stackId="1"
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.6}
              />
            ))}
            {showBrush && <Brush dataKey={xAxisKey} height={30} />}
          </AreaChart>
        );

      case CHART_TYPES.BAR:
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            {yAxisKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                onClick={handleClick}
              />
            ))}
            {showBrush && <Brush dataKey={xAxisKey} height={30} />}
          </BarChart>
        );

      case CHART_TYPES.PIE:
        return (
          <PieChart {...commonProps}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={yAxisKeys[0]}
              onClick={handleClick}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
          </PieChart>
        );

      default:
        return null;
    }
  };

  const chartStyle = {
    height: isFullscreen ? '80vh' : height,
    transition: 'all 0.3s ease',
    transform: `scale(${zoomLevel})`,
    transformOrigin: 'center center'
  };

  const cardStyle = isFullscreen ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    backgroundColor: '#fff',
    padding: '20px'
  } : {};

  return (
    <Card
      title={title}
      style={cardStyle}
      extra={
        <Space>
          {allowTypeChange && (
            <Select
              value={chartType}
              onChange={setChartType}
              style={{ width: 100 }}
              size="small"
            >
              <Option value={CHART_TYPES.LINE}>Line</Option>
              <Option value={CHART_TYPES.AREA}>Area</Option>
              <Option value={CHART_TYPES.BAR}>Bar</Option>
              <Option value={CHART_TYPES.PIE}>Pie</Option>
            </Select>
          )}
          
          <AntTooltip title="Zoom In">
            <Button
              size="small"
              icon={<ZoomInOutlined />}
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 2))}
              disabled={zoomLevel >= 2}
            />
          </AntTooltip>
          
          <AntTooltip title="Zoom Out">
            <Button
              size="small"
              icon={<ZoomOutOutlined />}
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.5))}
              disabled={zoomLevel <= 0.5}
            />
          </AntTooltip>

          {allowExport && (
            <AntTooltip title="Export Chart">
              <Button
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => handleExport('png')}
              />
            </AntTooltip>
          )}

          {allowFullscreen && (
            <AntTooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
              <Button
                size="small"
                icon={<FullscreenOutlined />}
                onClick={handleFullscreen}
                type={isFullscreen ? 'primary' : 'default'}
              />
            </AntTooltip>
          )}

          <AntTooltip title="Settings">
            <Button
              size="small"
              icon={<SettingOutlined />}
              onClick={() => setShowSettings(!showSettings)}
              type={showSettings ? 'primary' : 'default'}
            />
          </AntTooltip>
        </Space>
      }
    >
      {showSettings && (
        <div style={{ marginBottom: 16, padding: 16, background: '#f5f5f5', borderRadius: 4 }}>
          <Space wrap>
            <span>Grid:</span>
            <Switch checked={showGrid} onChange={setShowGrid} size="small" />
            <span>Legend:</span>
            <Switch checked={showLegend} onChange={setShowLegend} size="small" />
            <span>Tooltip:</span>
            <Switch checked={showTooltip} onChange={setShowTooltip} size="small" />
            {chartType !== CHART_TYPES.PIE && (
              <>
                <span>Brush:</span>
                <Switch checked={showBrush} onChange={setShowBrush} size="small" />
              </>
            )}
          </Space>
        </div>
      )}

      <div ref={chartRef} style={chartStyle}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {isFullscreen && (
        <Button
          style={{ position: 'absolute', top: 20, right: 20 }}
          onClick={handleFullscreen}
        >
          Exit Fullscreen
        </Button>
      )}
    </Card>
  );
};

export default InteractiveChart;
