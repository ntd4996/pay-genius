'use client';

import { cn } from '@nextui-org/react';
import TabsComponent from '../../components/Tabs';
import Divide from '@/app/components/Divide';

export default function Home() {
  return (
    <div className='isolate mx-auto flex min-h-screen flex-col'>
      <div
        className={cn('flex w-full flex-col', 'mx-auto max-w-screen-xl p-5')}
      >
        <div className='flex w-full flex-col'>
          <Divide />
        </div>
      </div>
    </div>
  );
}
