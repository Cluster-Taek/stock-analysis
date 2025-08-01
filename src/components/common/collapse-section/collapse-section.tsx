'use client';

import { ChevronDownMini, ChevronUpMini } from '@medusajs/icons';
import { Button, Heading } from '@medusajs/ui';
import React, { useState } from 'react';

interface CollapseSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  headingLevel?: 'h1' | 'h2' | 'h3';
}

/**
 * 접었다 펼 수 있는 섹션 컴포넌트
 */
export function CollapseSection({
  title,
  children,
  defaultOpen = true,
  className = '',
  headingLevel = 'h3',
}: CollapseSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 헤더 (제목 + 토글 버튼) */}
      <div className="flex items-center justify-between">
        <Heading level={headingLevel}>{title}</Heading>
        <Button variant="transparent" size="small" onClick={toggleOpen} className="h-8 w-8 p-0">
          {isOpen ? <ChevronUpMini className="h-4 w-4" /> : <ChevronDownMini className="h-4 w-4" />}
        </Button>
      </div>

      {/* 컨텐츠 */}
      {isOpen && <div className="space-y-3">{children}</div>}
    </div>
  );
}
