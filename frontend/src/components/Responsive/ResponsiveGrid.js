import React, { memo } from 'react';
import { Row, Col } from 'antd';
import { useResponsive } from '../../hooks/useResponsive';

/**
 * Responsive grid component that adapts to screen size
 */
const ResponsiveGrid = memo(({
  children,
  gutter = [16, 16],
  columns = {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 4,
    xxl: 6
  },
  minItemWidth = 200,
  ...rowProps
}) => {
  const { breakpoint, screenSize } = useResponsive();

  // Calculate responsive column span
  const getColSpan = () => {
    const currentColumns = columns[breakpoint] || columns.lg || 4;
    return 24 / currentColumns;
  };

  // Calculate dynamic columns based on screen width and min item width
  const getDynamicColumns = () => {
    if (minItemWidth) {
      const availableWidth = screenSize.width - 48; // Account for padding
      const possibleColumns = Math.floor(availableWidth / minItemWidth);
      const maxColumns = columns[breakpoint] || columns.lg || 4;
      return Math.min(possibleColumns, maxColumns);
    }
    return columns[breakpoint] || columns.lg || 4;
  };

  const colSpan = 24 / getDynamicColumns();

  return (
    <Row gutter={gutter} {...rowProps}>
      {React.Children.map(children, (child, index) => (
        <Col
          key={index}
          xs={24 / (columns.xs || 1)}
          sm={24 / (columns.sm || 2)}
          md={24 / (columns.md || 3)}
          lg={24 / (columns.lg || 4)}
          xl={24 / (columns.xl || 4)}
          xxl={24 / (columns.xxl || 6)}
          style={{ marginBottom: Array.isArray(gutter) ? gutter[1] : gutter }}
        >
          {child}
        </Col>
      ))}
    </Row>
  );
});

ResponsiveGrid.displayName = 'ResponsiveGrid';

export default ResponsiveGrid;
