'use client';

import { Table } from '@/medusa/components/table';
import { HistoricalDataPoint } from '@/types/yahoo-finance';
import { Container, Heading } from '@medusajs/ui';
import React from 'react';

interface StockDataTableProps {
  data: HistoricalDataPoint[];
  symbol: string;
  title?: string;
  className?: string;
}

/**
 * 주식 히스토리컬 데이터를 표시하는 테이블 컴포넌트
 */
export function StockDataTable({ data, symbol, title, className = '' }: StockDataTableProps) {
  if (!data || data.length === 0) {
    return null;
  }

  // 최신 데이터부터 표시하기 위해 역순 정렬
  const tableData = [...data].reverse().map((item, index) => ({
    ...item,
    id: index,
  }));

  const columns = [
    {
      key: 'date' as keyof (HistoricalDataPoint & { id: number }),
      label: '날짜',
      width: '120px',
      render: (value: string) => {
        const date = new Date(value);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      },
    },
    {
      key: 'open' as keyof (HistoricalDataPoint & { id: number }),
      label: '시가',
      width: '100px',
      render: (value: number) => `$${Number(value).toFixed(2)}`,
    },
    {
      key: 'high' as keyof (HistoricalDataPoint & { id: number }),
      label: '고가',
      width: '100px',
      render: (value: number) => `$${Number(value).toFixed(2)}`,
    },
    {
      key: 'low' as keyof (HistoricalDataPoint & { id: number }),
      label: '저가',
      width: '100px',
      render: (value: number) => `$${Number(value).toFixed(2)}`,
    },
    {
      key: 'close' as keyof (HistoricalDataPoint & { id: number }),
      label: '종가',
      width: '120px',
      render: (value: number, item: HistoricalDataPoint & { id: number }) => {
        const change = item.close - item.open;
        const changePercent = (change / item.open) * 100;
        const isPositive = change >= 0;

        return (
          <div className="space-y-1">
            <div className="font-medium">${Number(value).toFixed(2)}</div>
            <div className="text-xs">
              <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                {isPositive ? '+' : ''}${change.toFixed(2)}
              </span>
              <br />
              <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                ({isPositive ? '+' : ''}
                {changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'adjustedClose' as keyof (HistoricalDataPoint & { id: number }),
      label: '조정종가',
      width: '110px',
      render: (value: number) => `$${Number(value).toFixed(2)}`,
    },
    {
      key: 'volume' as keyof (HistoricalDataPoint & { id: number }),
      label: '거래량',
      width: '120px',
      render: (value: number) => Number(value).toLocaleString(),
    },
  ];

  return (
    <Container className={className}>
      <div className="space-y-4">
        <Heading level="h3">{title || `${symbol} 주식 데이터`}</Heading>
        <Table
          tableKey="stock-history-data"
          title={`${symbol} 히스토리컬 데이터`}
          columns={columns}
          data={tableData}
          pageSize={15}
          pagination={false}
          columnsVisibility={true}
        />
      </div>
    </Container>
  );
}
