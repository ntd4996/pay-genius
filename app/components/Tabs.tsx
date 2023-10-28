'use client';

import React, { useState } from 'react';
import { Tabs, Tab, Card, CardBody } from '@nextui-org/react';
import DivideByEachPerson from './DivideByEachPerson';

export default function TabsComponent() {
  return (
    <div className='flex w-full flex-col'>
      <Tabs aria-label='Options' color='primary' size='lg'>
        <Tab key='photos' title='Chia cho từng người'>
          <DivideByEachPerson />
        </Tab>
        <Tab key='music' title='Cho đều cho mọi người'>
          <Card>
            <CardBody>
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur.
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}
