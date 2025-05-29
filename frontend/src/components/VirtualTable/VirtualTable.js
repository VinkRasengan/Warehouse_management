import React, { memo, useMemo, useCallback } from 'react';
import { Table, Empty } from 'antd';
import { FixedSizeList as List } from 'react-window';
import styled from 'styled-components';

const VirtualTableContainer = styled.div`
  .ant-table-tbody > tr > td {
    border-bottom: 1px solid #f0f0f0;
  }
`;

const VirtualTable = memo(({
  columns,
  dataSource,
  height = 400,
  rowHeight = 54,
  loading = false,
  onRow,
  rowKey = 'id',
  scroll,
  ...tableProps
}) => {
  // Memoize columns to prevent unnecessary re-renders
  const memoizedColumns = useMemo(() => columns, [columns]);

  // Memoize row renderer
  const Row = useCallback(({ index, style }) => {
    const record = dataSource[index];
    if (!record) return null;

    const rowProps = onRow ? onRow(record, index) : {};

    return (
      <div style={style}>
        <table style={{ width: '100%', tableLayout: 'fixed' }}>
          <tbody>
            <tr {...rowProps}>
              {memoizedColumns.map((column, colIndex) => {
                const { dataIndex, key, render, width, align } = column;
                const cellKey = key || dataIndex || colIndex;
                let cellValue = dataIndex ? record[dataIndex] : '';

                if (render) {
                  cellValue = render(cellValue, record, index);
                }

                return (
                  <td
                    key={cellKey}
                    style={{
                      width: width || 'auto',
                      textAlign: align || 'left',
                      padding: '12px 16px',
                      borderBottom: '1px solid #f0f0f0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {cellValue}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    );
  }, [dataSource, memoizedColumns, onRow]);

  // Calculate total width
  const totalWidth = useMemo(() => {
    return memoizedColumns.reduce((sum, col) => {
      return sum + (col.width || 100);
    }, 0);
  }, [memoizedColumns]);

  if (!dataSource || dataSource.length === 0) {
    return (
      <VirtualTableContainer>
        <Table
          columns={memoizedColumns}
          dataSource={[]}
          loading={loading}
          locale={{ emptyText: <Empty description="No data" /> }}
          {...tableProps}
        />
      </VirtualTableContainer>
    );
  }

  return (
    <VirtualTableContainer>
      {/* Table Header */}
      <table style={{ width: '100%', tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ backgroundColor: '#fafafa' }}>
            {memoizedColumns.map((column, index) => {
              const { title, key, dataIndex, width, align } = column;
              const cellKey = key || dataIndex || index;

              return (
                <th
                  key={cellKey}
                  style={{
                    width: width || 'auto',
                    textAlign: align || 'left',
                    padding: '12px 16px',
                    borderBottom: '1px solid #f0f0f0',
                    fontWeight: 600,
                    backgroundColor: '#fafafa'
                  }}
                >
                  {title}
                </th>
              );
            })}
          </tr>
        </thead>
      </table>

      {/* Virtual List Body */}
      <List
        height={height}
        itemCount={dataSource.length}
        itemSize={rowHeight}
        width="100%"
        itemData={dataSource}
      >
        {Row}
      </List>
    </VirtualTableContainer>
  );
});

VirtualTable.displayName = 'VirtualTable';

export default VirtualTable;
