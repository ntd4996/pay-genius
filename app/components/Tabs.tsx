'use client';

import React from 'react';
import { Tabs, Tab, Card, CardBody } from '@nextui-org/react';
import DivideByEachPerson from './DivideByEachPerson';
import Divide from './Divide';

export default function TabsComponent() {
  return (
    <div className='flex w-full flex-col'>
      <Tabs aria-label='Options' color='primary' size='lg'>
        <Tab key='photos' title='Chia cho từng người'>
          <DivideByEachPerson />
        </Tab>
        <Tab key='test' title='test'>
          <Divide />
        </Tab>
        <Tab key='music' title='Chia đều cho mọi người'>
          <Card>
            <CardBody>Incoming</CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}
