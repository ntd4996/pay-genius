'use client';

import SplitTheBill from '@/app/components/SplitTheBill';
import React from 'react';

export default function CreateSplitTheBill() {
  const breadcrumbs = [
    {
      name: 'Dashboard',
      href: '/split-the-bill',
    },
    {
      name: 'Tạo mới hóa đơn',
      href: '',
    },
  ];
  return (
    <div className='isolate mx-auto flex min-h-full-screen flex-col'>
      <SplitTheBill breadcrumbs={breadcrumbs} isCreate />
    </div>
  );
}
