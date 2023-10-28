'use client';

import React from 'react';
import { Tabs, Tab, Card, CardBody, Input } from '@nextui-org/react';

export default function TabsComponent() {
  return (
    <div className='flex w-full flex-col'>
      <Tabs aria-label='Options' color='primary'>
        <Tab key='photos' title='Chi cho từng người'>
          <Card>
            <CardBody>
              <div className='flex flex-col gap-4'>
                <div className='text-xl font-semibold'>
                  Thông tin người hưởng thụ
                </div>
                <Input
                  variant='bordered'
                  isRequired
                  label='Tên người hưởng thụ'
                  className='max-w-xs'
                />
                <Input
                  variant='bordered'
                  isRequired
                  label='Số tài khoản người hưởng thụ'
                  className='max-w-xs'
                />
                <Input
                  variant='bordered'
                  isRequired
                  label='Nội dung chuyển khoản'
                  className='max-w-xs'
                  typeof='number'
                  maxLength={35}
                  description={
                    'Nội dung chuyển khoản viết không dấu, tối đa 35 ký tự'
                  }
                />
                <hr />
              </div>
            </CardBody>
          </Card>
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
