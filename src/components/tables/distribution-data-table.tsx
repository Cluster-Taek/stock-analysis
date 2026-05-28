'use client';

import { Table } from '@/medusa/components/table';
import { DistributionHistoryItem } from '@/types/yieldmax';
import { Container, Text } from '@medusajs/ui';
import React from 'react';

interface DistributionDataTableProps {
  data: DistributionHistoryItem[];
  symbol: string;
  className?: string;
}

/**
 * YieldMax ETF 배당 히스토리 데이터를 표시하는 테이블 컴포넌트
 */
export function DistributionDataTable({ data, symbol, className = '' }: DistributionDataTableProps) {
  if (!data || data.length === 0) {
    return null;
  }

  // 최신 데이터부터 표시하기 위해 날짜순 정렬
  const tableData = [...data]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((item, index) => ({
      ...item,
      id: index,
    }));

  const columns = [
    {
      key: 'date' as keyof (DistributionHistoryItem & { id: number }),
      label: '배당일',
      width: '120px',
      render: (value: string) => {
        const date = new Date(value + 'T00:00:00');
        if (isNaN(date.getTime())) {
          return value; // 날짜 파싱 실패 시 원본 반환
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      },
    },
    {
      key: 'amount' as keyof (DistributionHistoryItem & { id: number }),
      label: '배당금액',
      width: '120px',
      render: (value: number) => (
        <div className="space-y-1">
          <Text weight="plus" className="text-ui-fg-base">
            ${Number(value).toFixed(4)}
          </Text>
          <Text size="xsmall" className="text-ui-fg-muted">
            주당
          </Text>
        </div>
      ),
    },
    {
      key: 'exDate' as keyof (DistributionHistoryItem & { id: number }),
      label: '배당락일',
      width: '100px',
      render: (value: string | undefined) => {
        if (!value) return '-';
        const date = new Date(value + 'T00:00:00');
        if (isNaN(date.getTime())) {
          return value;
        }
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return (
          <Text size="small" className="text-ui-fg-muted">
            {month}/{day}
          </Text>
        );
      },
    },
    {
      key: 'recordDate' as keyof (DistributionHistoryItem & { id: number }),
      label: '기준일',
      width: '100px',
      render: (value: string | undefined) => {
        if (!value) return '-';
        const date = new Date(value + 'T00:00:00');
        if (isNaN(date.getTime())) {
          return value;
        }
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return (
          <Text size="small" className="text-ui-fg-muted">
            {month}/{day}
          </Text>
        );
      },
    },
    {
      key: 'payableDate' as keyof (DistributionHistoryItem & { id: number }),
      label: '지급일',
      width: '100px',
      render: (value: string | undefined) => {
        if (!value) return '-';
        const date = new Date(value + 'T00:00:00');
        if (isNaN(date.getTime())) {
          return value;
        }
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return (
          <Text size="small" className="text-ui-fg-muted">
            {month}/{day}
          </Text>
        );
      },
    },
  ];

  return (
    <Container className={className}>
      <Table
        tableKey="distribution-history-data"
        title={`${symbol} 배당 히스토리`}
        columns={columns}
        data={tableData}
        pageSize={15}
        pagination={false}
        columnsVisibility={true}
      />
    </Container>
  );
}
