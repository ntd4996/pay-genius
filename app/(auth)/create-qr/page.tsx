'use client';

import { cn } from '@nextui-org/react';
import CreateQR from '@/app/components/CreateQR';

export default function Home() {
  return (
    <div className='isolate mx-auto flex min-h-full-screen flex-col'>
      <div
        className={cn('flex w-full flex-col', 'mx-auto max-w-screen-xl p-5')}
      >
        <div className='flex w-full flex-col'>
          <CreateQR />
        </div>
      </div>
    </div>
  );
}
