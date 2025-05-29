import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  Space,
  Collapse,
  InputNumber,
  Checkbox,
  Tag,
  Tooltip
} from 'antd';
import {
  SearchOutlined,
  ClearOutlined,
  FilterOutlined,
  SaveOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;

const AdvancedSearch = ({
  onSearch,
  onClear,
  filters = [],
  savedSearches = [],
  onSaveSearch,
  onLoadSearch,
  loading = false,
  placeholder = "Search...",
  showSavedSearches = true,
  showAdvancedFilters = true
}) => {
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Handle search
  const handleSearch = () => {
    const values = form.getFieldsValue();
    const searchParams = {
      searchText,
      ...values,
      ...activeFilters
    };

    // Remove empty values
    Object.keys(searchParams).forEach(key => {
      if (searchParams[key] === undefined || searchParams[key] === null || searchParams[key] === '') {
        delete searchParams[key];
      }
    });

    onSearch(searchParams);
  };

  // Handle clear
  const handleClear = () => {
    setSearchText('');
    setActiveFilters({});
    form.resetFields();
    onClear();
  };

  // Handle filter change
  const handleFilterChange = (filterKey, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  // Handle save search
  const handleSaveSearch = () => {
    const values = form.getFieldsValue();
    const searchParams = {
      searchText,
      ...values,
      ...activeFilters
    };

    const searchName = prompt('Enter search name:');
    if (searchName) {
      onSaveSearch({
        name: searchName,
        params: searchParams,
        createdAt: new Date().toISOString()
      });
    }
  };

  // Handle load saved search
  const handleLoadSearch = (savedSearch) => {
    const { params } = savedSearch;
    setSearchText(params.searchText || '');
    setActiveFilters(params);
    form.setFieldsValue(params);
    onLoadSearch(savedSearch);
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    return Object.keys(activeFilters).filter(key => 
      activeFilters[key] !== undefined && 
      activeFilters[key] !== null && 
      activeFilters[key] !== ''
    ).length;
  };

  // Render filter component based on type
  const renderFilter = (filter) => {
    const { key, label, type, options, placeholder: filterPlaceholder } = filter;

    switch (type) {
      case 'select':
        return (
          <Select
            placeholder={filterPlaceholder || `Select ${label}`}
            allowClear
            onChange={(value) => handleFilterChange(key, value)}
            value={activeFilters[key]}
          >
            {options?.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        );

      case 'multiselect':
        return (
          <Select
            mode="multiple"
            placeholder={filterPlaceholder || `Select ${label}`}
            allowClear
            onChange={(value) => handleFilterChange(key, value)}
            value={activeFilters[key]}
          >
            {options?.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        );

      case 'daterange':
        return (
          <RangePicker
            onChange={(dates) => handleFilterChange(key, dates)}
            value={activeFilters[key]}
          />
        );

      case 'number':
        return (
          <InputNumber
            placeholder={filterPlaceholder || `Enter ${label}`}
            style={{ width: '100%' }}
            onChange={(value) => handleFilterChange(key, value)}
            value={activeFilters[key]}
          />
        );

      case 'numberrange':
        return (
          <Input.Group compact>
            <InputNumber
              placeholder="Min"
              style={{ width: '50%' }}
              onChange={(value) => handleFilterChange(`${key}_min`, value)}
              value={activeFilters[`${key}_min`]}
            />
            <InputNumber
              placeholder="Max"
              style={{ width: '50%' }}
              onChange={(value) => handleFilterChange(`${key}_max`, value)}
              value={activeFilters[`${key}_max`]}
            />
          </Input.Group>
        );

      case 'checkbox':
        return (
          <Checkbox.Group
            options={options}
            onChange={(value) => handleFilterChange(key, value)}
            value={activeFilters[key]}
          />
        );

      default:
        return (
          <Input
            placeholder={filterPlaceholder || `Enter ${label}`}
            onChange={(e) => handleFilterChange(key, e.target.value)}
            value={activeFilters[key]}
          />
        );
    }
  };

  // Render active filter tags
  const renderActiveFilters = () => {
    const activeTags = [];

    Object.keys(activeFilters).forEach(key => {
      const value = activeFilters[key];
      if (value !== undefined && value !== null && value !== '') {
        const filter = filters.find(f => f.key === key);
        const label = filter?.label || key;

        let displayValue = value;
        if (Array.isArray(value)) {
          displayValue = value.join(', ');
        } else if (moment.isMoment(value)) {
          displayValue = value.format('YYYY-MM-DD');
        }

        activeTags.push(
          <Tag
            key={key}
            closable
            onClose={() => handleFilterChange(key, undefined)}
          >
            {label}: {displayValue}
          </Tag>
        );
      }
    });

    return activeTags;
  };

  return (
    <Card>
      {/* Main Search Bar */}
      <Row gutter={[16, 16]} align="middle">
        <Col flex="auto">
          <Input.Search
            placeholder={placeholder}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearch}
            enterButton={<SearchOutlined />}
            size="large"
            loading={loading}
          />
        </Col>
        <Col>
          <Space>
            {showAdvancedFilters && (
              <Tooltip title="Advanced Filters">
                <Button
                  icon={<FilterOutlined />}
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  type={showAdvanced ? 'primary' : 'default'}
                >
                  Filters {getActiveFilterCount() > 0 && `(${getActiveFilterCount()})`}
                </Button>
              </Tooltip>
            )}
            <Button
              icon={<ClearOutlined />}
              onClick={handleClear}
              disabled={!searchText && getActiveFilterCount() === 0}
            >
              Clear
            </Button>
            {onSaveSearch && (
              <Button
                icon={<SaveOutlined />}
                onClick={handleSaveSearch}
                disabled={!searchText && getActiveFilterCount() === 0}
              >
                Save
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      {/* Active Filters */}
      {getActiveFilterCount() > 0 && (
        <Row style={{ marginTop: 16 }}>
          <Col span={24}>
            <Space wrap>
              <span style={{ color: '#666' }}>Active filters:</span>
              {renderActiveFilters()}
            </Space>
          </Col>
        </Row>
      )}

      {/* Advanced Filters */}
      {showAdvanced && showAdvancedFilters && (
        <Collapse
          style={{ marginTop: 16 }}
          defaultActiveKey={['filters']}
        >
          <Panel header="Advanced Filters" key="filters">
            <Form form={form} layout="vertical">
              <Row gutter={[16, 16]}>
                {filters.map(filter => (
                  <Col key={filter.key} xs={24} sm={12} md={8} lg={6}>
                    <Form.Item label={filter.label} name={filter.key}>
                      {renderFilter(filter)}
                    </Form.Item>
                  </Col>
                ))}
              </Row>
              <Row>
                <Col span={24}>
                  <Space>
                    <Button type="primary" onClick={handleSearch} loading={loading}>
                      Apply Filters
                    </Button>
                    <Button onClick={handleClear}>
                      Reset Filters
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Form>
          </Panel>
        </Collapse>
      )}

      {/* Saved Searches */}
      {showSavedSearches && savedSearches.length > 0 && (
        <Collapse style={{ marginTop: 16 }}>
          <Panel header="Saved Searches" key="saved">
            <Space wrap>
              {savedSearches.map((savedSearch, index) => (
                <Button
                  key={index}
                  size="small"
                  icon={<HistoryOutlined />}
                  onClick={() => handleLoadSearch(savedSearch)}
                >
                  {savedSearch.name}
                </Button>
              ))}
            </Space>
          </Panel>
        </Collapse>
      )}
    </Card>
  );
};

export default AdvancedSearch;
