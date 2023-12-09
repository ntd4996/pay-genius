/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, { Fragment, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ToastContainer, toast } from 'react-toastify';
import {
  Autocomplete,
  AutocompleteItem,
  Avatar,
  Button,
  Card,
  CardBody,
  Image,
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  cn,
} from '@nextui-org/react';
import { DataBank } from '../data/bank';
import axios from '../libs/axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import PlusCircle from '../assets/svg/PlusCircle';
import TrashBin from '../assets/svg/TrashBin';
import { Mentions } from '../data/mentions';

export default function Divide() {
  const {
    getValues,
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = useForm({ mode: 'all' });

  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [listUsers, setListUsers] = useState<any[]>([]);

  const [valueName, setValueName] = React.useState<string>('');
  const [valueBank, setValueBank] = React.useState<string>('');
  const [valueAccountNumber, setValueAccountNumber] =
    React.useState<string>('');
  const [selectedKey, setSelectedKey] = React.useState<React.Key | null>(null);
  const [shipping, setShipping] = useState('');
  const [amountDiscount, setAmountDiscount] = useState('');
  const [selectedKeyBank, setSelectedKeyBank] = React.useState<any>('');
  const [listTable, setListTable] = useState([
    {
      label: '@',
      value: '1',
    },
    {
      label: 'Số tiền',
      value: '',
    },
    {
      label: 'Số tiền được giảm giá',
      value: '',
    },
    {
      label: 'Tiền sau khi giảm',
      value: '',
    },
    {
      label: 'QR',
      value: '',
    },
  ]);

  const [headerTable, setHeaderTable] = useState([
    '',
    '@',
    'Số tiền',
    'Số tiền được giảm giá',
    'Tiền sau khi giảm',
    'QR',
  ]);

  const [listTransferPerson, setListTransferPerson] = useState<any[]>([
    {
      mention: '',
      amount: '',
      discountAmount: 0,
      moneyAfterReduction: 0,
    },
  ]);

  const { isLoading, refetch } = useQuery({
    queryKey: [`get-users-acc`],
    queryFn: async () => {
      const result = await axios(`/api/get-user`);
      const arrayResult = result.data.map((item: any) => {
        const matchingDataBank = DataBank.find(
          (bank) => bank.label === item.code_bank
        );
        return {
          ...item,
          label: item.name,
          dataBank: {
            ...matchingDataBank,
          },
        };
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
    onSuccess: () => {
      toast.success('Lưu tài khoản thành công! 🎉');
      setIsLoadingPost(false);
      refetch();
    },
    onError: () => {
      setIsLoadingPost(false);
    },
  });

  const onSubmit = (data: any) => {
    if (!selectedKey) {
      postData(data);
    }
  };

  const onSelectionChange = (key: React.Key) => {
    if (key) {
      const matchingDataBank = listUsers.find(
        (user) => user.id.toString() === key
      );
      if (matchingDataBank) {
        setValue('bank', matchingDataBank.code_bank);
        setValue('accountNumber', matchingDataBank.account_number);
        setValueBank(matchingDataBank.dataBank.label);
        setValueAccountNumber(matchingDataBank.account_number);
        setSelectedKeyBank(matchingDataBank.dataBank.label);
      }
    }
    setSelectedKey(key);
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

  const onSelectionChangeBank = (key: React.Key) => {
    setSelectedKeyBank(key);
  };

  const addPerson = () => {
    const updatedList = [
      ...listTransferPerson,
      {
        mention: '',
        amount: '',
        discountAmount: 0,
        moneyAfterReduction: 0,
      },
    ];

    const discountPerson =
      (parseFloat(amountDiscount) || 0) / updatedList.length;
    const shippingPerson = (parseFloat(shipping) || 0) / updatedList.length;

    updatedList.map((person) => {
      person.discountAmount = Math.round(discountPerson);
      person.moneyAfterReduction = Math.round(
        person.amount - discountPerson + shippingPerson
      );
    });

    setListTransferPerson(updatedList);
  };

  const deletePerson = (index: number) => {
    const updatedList = [...listTransferPerson];

    updatedList.splice(index, 1);

    const discountPerson =
      (parseFloat(amountDiscount) || 0) / updatedList.length;
    const shippingPerson = (parseFloat(shipping) || 0) / updatedList.length;

    updatedList.map((person) => {
      person.discountAmount = Math.round(discountPerson);
      person.moneyAfterReduction = Math.round(
        person.amount - discountPerson + shippingPerson
      );
    });

    setListTransferPerson(updatedList);
  };

  const changeMention = (value: any, index: number) => {
    const updatedList = [...listTransferPerson];
    updatedList[index].mention = value;
    setListTransferPerson(updatedList);
  };
  const changeAmount = (value: any, index: number) => {
    const updatedList = [...listTransferPerson];
    updatedList[index].amount = value.target.value;
    setListTransferPerson(updatedList);
    calculator();
  };

  useEffect(() => {
    calculator();
  }, [shipping, amountDiscount]);

  const calculator = () => {
    const updatedList = [...listTransferPerson];

    const discountPerson =
      (parseFloat(amountDiscount) || 0) / updatedList.length;
    const shippingPerson = (parseFloat(shipping) || 0) / updatedList.length;

    updatedList.map((person) => {
      person.discountAmount = Math.round(discountPerson);
      person.moneyAfterReduction = Math.round(
        person.amount - discountPerson + shippingPerson
      );
    });

    setListTransferPerson(updatedList);
  };

  const formatCurrencyVND = (amount: any) => {
    const formattedAmount = amount.toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND',
    });
    return formattedAmount;
  };

  return (
    <Card>
      <ToastContainer />
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
                  isLoading={isLoading}
                  onSelectionChange={onSelectionChange}
                  onInputChange={onInputChange}
                  isRequired
                  isDisabled={isLoadingPost}
                >
                  {(item) => (
                    <AutocompleteItem
                      key={item.id}
                      value={item.id}
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
                  isDisabled={isLoadingPost}
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
                  type='number'
                  isRequired
                  label='Số tài khoản'
                  variant='bordered'
                  isInvalid={!!errors.accountNumber}
                  errorMessage={
                    errors.accountNumber && 'Trường này là bắt buộc'
                  }
                  className='max-w-lg'
                  onChange={onInputChangeAccountNumber}
                  isDisabled={isLoadingPost}
                  value={valueAccountNumber}
                />

                <>
                  {!selectedKey && (
                    <Button
                      isLoading={isLoadingPost}
                      color='primary'
                      onClick={handleSubmit(onSubmit)}
                      className='max-w-fit'
                      isDisabled={isLoading}
                    >
                      Lưu mới số tài khoản
                    </Button>
                  )}
                </>
              </div>
            </div>
          </div>
          <div className='flex w-full flex-col items-center justify-center'>
            <Image
              width={300}
              alt='NextUI hero Image'
              src={`https://img.vietqr.io/image/${valueBank}-${valueAccountNumber}-print.png?accountName=${valueName}`}
            />
          </div>
        </div>

        <div className='mt-4 flex gap-4 border-t-1 pt-4'>
          <Input
            type='number'
            label='Tổng số tiền giảm giá'
            variant='bordered'
            className='max-w-lg'
            min={0}
            value={amountDiscount}
            onChange={(e) => setAmountDiscount(e.target.value)}
            endContent={
              <div className='pointer-events-none flex items-center'>
                <span className='text-small text-default-400'>VNĐ</span>
              </div>
            }
          />
          <Input
            type='number'
            min={0}
            label='Phí Ship'
            variant='bordered'
            className='max-w-lg'
            value={shipping}
            onChange={(e) => setShipping(e.target.value)}
            endContent={
              <div className='pointer-events-none flex items-center'>
                <span className='text-small text-default-400'>VNĐ</span>
              </div>
            }
          />
        </div>

        <div className='mt-4 flex w-full flex-col gap-4'>
          <div className='text-tiny italic text-default-400'>
            Tổng số tiền sau khi thanh toán toàn bộ nhận được: 0đ
          </div>

          <div className='flex w-full flex-auto flex-row gap-4'>
            <div className='w-[90%]'>
              <Table className='w-full'>
                <TableHeader>
                  {headerTable.map((list, index) => (
                    <TableColumn
                      key={index}
                      className={cn(
                        index === 0
                          ? 'w-[80px] min-w-[80px]'
                          : 'w-[200px] min-w-[200px]',
                        'text-center'
                      )}
                    >
                      {list}
                    </TableColumn>
                  ))}
                </TableHeader>
                <TableBody>
                  {listTransferPerson.map((person, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Button
                          isIconOnly
                          color='danger'
                          aria-label='Like'
                          isDisabled={listTransferPerson.length <= 1}
                          onClick={() => deletePerson(index)}
                        >
                          <TrashBin />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Autocomplete
                          defaultItems={Mentions}
                          variant='bordered'
                          label='Mention'
                          labelPlacement='inside'
                          className='max-w-lg'
                          onSelectionChange={(e) => changeMention(e, index)}
                          selectedKey={listTransferPerson[index].mention}
                        >
                          {(person) => (
                            <AutocompleteItem
                              key={person.label}
                              textValue={person.label}
                            >
                              <div className='flex items-center gap-2'>
                                <div className='flex flex-col'>
                                  <span className='text-small'>
                                    {person.label}
                                  </span>
                                </div>
                              </div>
                            </AutocompleteItem>
                          )}
                        </Autocomplete>
                      </TableCell>
                      <TableCell>
                        {' '}
                        <Input
                          type='number'
                          label='Số tiền'
                          variant='bordered'
                          className='max-w-lg'
                          value={person.amount}
                          min={0}
                          onChange={(e) => {
                            changeAmount(e, index);
                          }}
                        />
                      </TableCell>
                      <TableCell className='text-center'>
                        {formatCurrencyVND(person.discountAmount)}
                      </TableCell>
                      <TableCell className='text-center'>
                        {formatCurrencyVND(person.moneyAfterReduction)}
                      </TableCell>
                      <TableCell>
                        <Image
                          width={200}
                          alt='NextUI hero Image'
                          src={`https://img.vietqr.io/image/${valueBank}-${valueAccountNumber}-print.png?amount=${person.moneyAfterReduction}&accountName=${valueName}`}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className='flex- w-full'>
              <Button
                color='primary'
                className='mt-4'
                startContent={<PlusCircle />}
              >
                Thêm cột
              </Button>
            </div>
          </div>

          <Button
            color='primary'
            className='mt-4 max-w-fit'
            startContent={<PlusCircle />}
            onClick={() => addPerson()}
          >
            Thêm dòng
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
