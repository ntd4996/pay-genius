'use client';

import React from 'react';
import { Tabs, Tab } from '@nextui-org/react';
import Divide from './Divide';
import CreateQR from './CreateQR';

export default function TabsComponent() {
  return (
    <div className='flex w-full flex-col'>
      <Tabs aria-label='Options' color='primary' size='lg'>
        <Tab key='Chia tiền' title='Chia tiền'>
          <Divide />
        </Tab>
        <Tab key='music' title='Tạo mã QR'>
          <CreateQR />
        </Tab>
      </Tabs>
    </div>
  );
}
