'use client';
import { cn } from '@/lib/utils';
import { BreadcrumbItem, Breadcrumbs } from '@nextui-org/react';
import React from 'react';

export default function CreateSplitTheBill() {
  return (
    <div className='isolate mx-auto flex min-h-full-screen flex-col'>
      <div
        className={cn('flex w-full flex-col', 'mx-auto max-w-screen-2xl p-5')}
      >
        <div>
          <Breadcrumbs>
            <BreadcrumbItem href='/split-the-bill'>Dashboard</BreadcrumbItem>
            <BreadcrumbItem>Tạo mới hóa đơn</BreadcrumbItem>
          </Breadcrumbs>
        </div>
      </div>
    </div>
  );
}
