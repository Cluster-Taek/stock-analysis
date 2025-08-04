'use client';

import { ControlledSelectBox } from '../common/controlled-select-box';
import { PortfolioSelector } from '../common/portfolio-selector';
import { IBacktestingParams } from '@/types/investor';
import { ChevronDown } from '@medusajs/icons';
import { Button, Container, Heading, Input, Text } from '@medusajs/ui';
import { useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

const BacktestingHeader = () => {
  const [open, setOpen] = useState(true);

  const form = useForm<IBacktestingParams>({
    defaultValues: {},
  });

  const handleSubmit = form.handleSubmit((data) => {
    console.log(data);
  });

  const handleReset = () => {
    form.reset();
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit}>
        <Container className="w-full p-0 divide-y">
          <div className="flex items-center justify-between px-6 py-4">
            <Heading level="h1" className="text-ui-fg-base">
              백테스팅
            </Heading>
            <div>
              <Button type="button" size="small" variant="transparent" onClick={() => setOpen(!open)}>
                {open ? '닫기' : '열기'}
                <ChevronDown
                  fontSize={15}
                  className={`transition-transform ${open ? 'transform rotate-180' : 'transform rotate-0'}`}
                />
              </Button>
            </div>
          </div>
          <></>
          {open && (
            <>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col w-full gap-2 px-6">
                  <Text className="text-ui-fg-subtle">포트폴리오</Text>
                  <PortfolioSelector value={[]} onChange={() => {}} />
                </div>
                <div className="flex flex-col w-full gap-2 px-6">
                  <Text className="text-ui-fg-subtle">초기 투자금</Text>
                  <Controller
                    control={form.control}
                    name="initialCapital"
                    render={({ field: { ...field } }) => {
                      return <Input type="number" disabled {...field} />;
                    }}
                  />
                </div>
                <div className="flex flex-col w-full gap-2 px-6">
                  <Text className="text-ui-fg-subtle">시작일</Text>
                  <Controller
                    control={form.control}
                    name="startDate"
                    render={({ field: { ...field } }) => {
                      return <Input type="date" {...field} />;
                    }}
                  />
                  <Text className="text-ui-fg-subtle">종료일</Text>
                  <Controller
                    control={form.control}
                    name="endDate"
                    render={({ field: { ...field } }) => {
                      return <Input type="date" {...field} />;
                    }}
                  />
                </div>
                <div className="flex flex-col w-full gap-2 px-6">
                  <Text className="text-ui-fg-subtle">데이터 간격</Text>
                  <ControlledSelectBox
                    form={form}
                    name="interval"
                    options={[
                      { label: '일별', value: '1d' },
                      { label: '주별', value: '1wk' },
                      { label: '월별', value: '1mo' },
                    ]}
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4">
                <Button type="button" size="small" variant="secondary" onClick={handleReset}>
                  취소
                </Button>
                <Button size="small" variant="primary">
                  테스트 시작
                </Button>
              </div>
            </>
          )}
        </Container>
      </form>
    </FormProvider>
  );
};

export default BacktestingHeader;
