/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  Autocomplete,
  AutocompleteItem,
  Avatar,
  Card,
  CardBody,
  Image,
  Input,
} from '@nextui-org/react';
import { DataBank } from '../data/bank';
import axios from '../libs/axios';
import { useMutation } from '@tanstack/react-query';
import NumberInput from './NumberInput';

export default function CreateQR() {
  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = useForm({ mode: 'all' });

  const [listUsers, setListUsers] = useState<any[]>([]);
  const [selectedKeyName, setSelectedKeyName] = useState<any>('');

  const [valueName, setValueName] = React.useState<string>('');
  const [valueBank, setValueBank] = React.useState<string>('');
  const [valueAccountNumber, setValueAccountNumber] =
    React.useState<string>('');
  const [valueAmount, setValueAmount] = React.useState<string>('');
  const [selectedKeyBank, setSelectedKeyBank] = React.useState<any>('');

  const { mutate: getAccounts, isPending } = useMutation({
    mutationFn: async () => {
      const response = await axios(`/api/accounts`);
      const result = response.data.accounts;
      const arrayResult = result.map((item: any) => {
        const matchingDataBank = DataBank.find(
          (bank) => bank.label === item.codeBank
        );
        return {
          ...item,
          label: item.name,
          dataBank: {
            ...matchingDataBank,
          },
        };
      });
      return arrayResult;
    },
    onSuccess: (data) => {
      if (data.length > 0) {
        setListUsers(data);
      }
    },
    onError: (e) => {
      toast.error('Có lỗi xảy ra');
    },
  });

  useEffect(() => {
    getAccounts();
  }, [getAccounts]);

  const onSelectionChange = (key: React.Key) => {
    if (key) {
      const matchingDataBank = listUsers.find(
        (user) => user.name.toString() === key
      );
      if (matchingDataBank) {
        setValue('bank', matchingDataBank.dataBank.label);
        setValue('accountNumber', matchingDataBank.accountNumber);
        setValueBank(matchingDataBank.dataBank.label);
        setValueAccountNumber(matchingDataBank.accountNumber);
        setSelectedKeyBank(matchingDataBank.dataBank.label);
      }
      setSelectedKeyName(key);
    }
  };

  const onInputChange = (value: string) => {
    setValueName(value);
  };
  const onInputChangeBank = (value: string) => {
    setValueBank(value);
  };
  const onInputChangeAccountNumber = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setValueAccountNumber(event.target.value);
  };
  const onInputChangeAmount = (event: string) => {
    setValueAmount(event);
  };

  const onSelectionChangeBank = (key: React.Key) => {
    setSelectedKeyBank(key);
  };

  return (
    <Card>
      <CardBody className='w-full p-8'>
        <div className='flex w-full flex-col justify-start gap-14 lg:flex-row'>
          <div className='flex w-full flex-col gap-4'>
            <div className='text-xl font-semibold'>
              Thông tin người hưởng thụ
            </div>

            <div className='flex w-full flex-col lg:flex-row'>
              <div className='flex w-full flex-col gap-4'>
                <Autocomplete
                  {...register('name', {
                    required: true,
                  })}
                  label='Tên người hưởng thụ'
                  variant='bordered'
                  defaultItems={listUsers}
                  className='max-w-lg'
                  allowsCustomValue={true}
                  errorMessage={errors.name && 'Trường này là bắt buộc'}
                  isInvalid={!!errors.name}
                  isLoading={isPending}
                  onSelectionChange={onSelectionChange}
                  onInputChange={onInputChange}
                  selectedKey={selectedKeyName}
                  isRequired
                  onKeyDown={(e: any) => e.continuePropagation()}
                >
                  {(item) => (
                    <AutocompleteItem
                      key={item.name}
                      value={item.name}
                      textValue={item.label}
                    >
                      <div className='flex items-center gap-2'>
                        <Avatar
                          alt={item.dataBank.value}
                          className='h-14 w-14 flex-shrink-0 text-large'
                          src={item.dataBank.logo}
                          classNames={{
                            img: ['object-contain'],
                            base: 'bg-transparent',
                          }}
                        />
                        <div className='flex flex-col'>
                          <span className='text-small'>
                            {item.label} - {item.account_number} -{' '}
                            {item.dataBank.label}
                          </span>
                          <span className='text-tiny text-default-400'>
                            {item.dataBank.name}
                          </span>
                        </div>
                      </div>
                    </AutocompleteItem>
                  )}
                </Autocomplete>

                <Autocomplete
                  defaultItems={DataBank}
                  variant='bordered'
                  label='Ngân hàng'
                  labelPlacement='inside'
                  className='max-w-lg'
                  {...register('bank', {
                    required: true,
                  })}
                  errorMessage={errors.bank && 'Trường này là bắt buộc'}
                  isInvalid={!!errors.bank}
                  isRequired
                  onInputChange={onInputChangeBank}
                  selectedKey={selectedKeyBank}
                  onSelectionChange={onSelectionChangeBank}
                >
                  {(bank) => (
                    <AutocompleteItem key={bank.label} textValue={bank.label}>
                      <div className='flex items-center gap-2'>
                        <Avatar
                          alt={bank.value}
                          className='h-14 w-14 flex-shrink-0 text-large'
                          src={bank.logo}
                          classNames={{
                            img: ['object-contain'],
                            base: 'bg-transparent',
                          }}
                        />
                        <div className='flex flex-col'>
                          <span className='text-small'>{bank.label}</span>
                          <span className='text-tiny text-default-400'>
                            {bank.name}
                          </span>
                        </div>
                      </div>
                    </AutocompleteItem>
                  )}
                </Autocomplete>

                <Input
                  {...register('accountNumber', {
                    required: true,
                  })}
                  isRequired
                  label='Số tài khoản'
                  variant='bordered'
                  isInvalid={!!errors.accountNumber}
                  errorMessage={
                    errors.accountNumber && 'Trường này là bắt buộc'
                  }
                  className='max-w-lg'
                  onChange={onInputChangeAccountNumber}
                  value={valueAccountNumber}
                />

                <NumberInput
                  label='Số tiền'
                  value={valueAmount}
                  onChange={(e) => {
                    onInputChangeAmount(e ?? '');
                  }}
                  className='max-w-lg'
                />
              </div>
            </div>
          </div>
          <div className='flex w-full flex-col items-center justify-center'>
            <Image
              width={300}
              alt='NextUI hero Image'
              src={`https://img.vietqr.io/image/${valueBank}-${valueAccountNumber}-print.png?amount=${valueAmount}&accountName=${valueName}`}
            />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
