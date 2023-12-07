'use client';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ToastContainer } from 'react-toastify';
import CreatableSelect from 'react-select/creatable';
import Select from 'react-select';
import { Button, Card, CardBody, Input, cn } from '@nextui-org/react';
import { DataBank } from '../data/bank';
import axios from '../libs/axios';
import { useMutation, useQuery } from '@tanstack/react-query';

export default function Divide() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: 'all' });

  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [listUsers, setListUsers] = useState<any[]>([]);

  const { isLoading } = useQuery({
    queryKey: [`get-users-acc`],
    queryFn: async () => {
      const result = await axios(`/api/get-user`);
      const arrayResult = result.data.map((item: any) => {
        return { ...item, label: item.name };
      });
      setListUsers(arrayResult);
      return arrayResult;
    },
  });

  const { mutate: postData } = useMutation({
    mutationFn: async (data) => {
      setIsLoadingPost(true);
      const response = await axios.post(`/api/create-user`, data);
      return response;
    },
    onSuccess: (data) => {
      setIsLoadingPost(false);
    },
    onError: (error) => {
      setIsLoadingPost(false);
    },
  });

  const onSubmit = async (data: any) => {
    console.log(data);
    await postData(data);
  };

  return (
    <Card>
      <ToastContainer />
      <CardBody>
        <div className='flex w-full flex-col justify-start gap-14 lg:flex-row'>
          <div className='flex min-w-max flex-col gap-4 lg:max-w-xs'>
            <div className='text-xl font-semibold'>
              Thông tin người hưởng thụ
            </div>

            <Controller
              name='nameOfTheFirstInput'
              control={control}
              rules={{ required: 'Trường này là bắt buộc' }}
              render={({ field }) => (
                <div className='w-[300px]'>
                  <CreatableSelect
                    isLoading={isLoading}
                    options={listUsers}
                    required
                    value={field.value}
                    onChange={field.onChange}
                    placeholder='Tên người hưởng thụ'
                    classNames={{
                      control: () =>
                        cn(
                          'h-[56px] !border-medium  !rounded-medium !duration-150 !group-data-[focus=true]:border-foreground !focus:border-foreground',
                          errors.nameOfTheFirstInput
                            ? '!border-danger'
                            : '!border-default-200'
                        ),
                      option: () => cn('z-50'),
                    }}
                  />
                  <div className='relative flex flex-col gap-1.5 px-1 pt-1 text-tiny text-danger'>
                    {errors.nameOfTheFirstInput && 'Trường này là bắt buộc'}
                  </div>
                </div>
              )}
            />

            <Controller
              name='codeBank'
              control={control}
              rules={{ required: 'Trường này là bắt buộc' }}
              render={({ field }) => (
                <div>
                  <Select
                    options={DataBank}
                    required
                    value={field.value}
                    onChange={field.onChange}
                    placeholder='Ngân hàng'
                    classNames={{
                      control: () =>
                        cn(
                          'h-[56px] !border-medium  !rounded-medium !duration-150 !group-data-[focus=true]:border-foreground !focus:border-foreground',
                          errors.codeBank
                            ? '!border-danger'
                            : '!border-default-200'
                        ),
                      option: () => cn('z-50'),
                    }}
                  />
                  <div className='relative flex flex-col gap-1.5 px-1 pt-1 text-tiny text-danger'>
                    {errors.codeBank && 'Trường này là bắt buộc'}
                  </div>
                </div>
              )}
            />

            <Controller
              name='accountNumber'
              control={control}
              rules={{ required: 'Trường này là bắt buộc' }}
              render={({ field }) => (
                <Input
                  variant='bordered'
                  label='Số tài khoản người hưởng thụ'
                  value={field.value}
                  onChange={field.onChange}
                  classNames={{
                    inputWrapper: errors.accountNumber && 'border-danger',
                    label: ['z-1'],
                  }}
                  errorMessage={
                    errors.accountNumber && 'Trường này là bắt buộc'
                  }
                />
              )}
            />
          </div>
        </div>

        <div className='mt-4 flex w-full items-center justify-start'>
          <Button
            isLoading={isLoadingPost}
            color='primary'
            onClick={handleSubmit(onSubmit)}
          >
            Cập nhật Review
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
