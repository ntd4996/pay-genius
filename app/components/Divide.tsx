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
  cn,
} from '@nextui-org/react';
import { DataBank } from '../data/bank';
import axios from '../libs/axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import PlusCircle from '../assets/svg/PlusCircle';
import TrashBin from '../assets/svg/TrashBin';
import { Mentions } from '../data/mentions';
import Close from '../assets/svg/Close';
import CheckIcon from '../assets/svg/CheckIcon';
import Copy from '../assets/svg/Copy';
import CurrencyInput from 'react-currency-input-field';
import NumberInput from './NumberInput';

export default function Divide() {
  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = useForm({ mode: 'all' });

  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [listUsers, setListUsers] = useState<any[]>([]);

  const [valueName, setValueName] = React.useState<string>('');
  const [valueBank, setValueBank] = React.useState<string>('');
  const [copied, setCopied] = useState(false);
  const [valueAccountNumber, setValueAccountNumber] =
    React.useState<string>('');
  const [selectedKey, setSelectedKey] = React.useState<React.Key | null>(null);
  const [shipping, setShipping] = useState('');
  const [amountDiscount, setAmountDiscount] = useState('');
  const [selectedKeyBank, setSelectedKeyBank] = React.useState<any>('');
  const [headerTable, setHeaderTable] = useState([
    {
      label: 'Xóa',
      value: '1',
    },
    {
      label: '@',
      value: '',
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
      label: 'Tổng Tiền',
      value: '0',
    },
    {
      label: 'QR',
      value: '',
    },
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

    const filteredPeople = updatedList.filter(
      (person) => parseFloat(person.amount) !== 0 && person.amount !== ''
    );

    const discountPerson =
      (parseFloat(amountDiscount) || 0) / filteredPeople.length;
    const shippingPerson = (parseFloat(shipping) || 0) / filteredPeople.length;

    updatedList.map((person) => {
      if (person.amount) {
        person.discountAmount = Math.round(discountPerson);
        person.moneyAfterReduction = Math.round(
          person.amount - discountPerson + shippingPerson
        );
      } else {
        person.discountAmount = 0;
        person.moneyAfterReduction = 0;
      }
    });
    setListTransferPerson(updatedList);
  };

  const deletePerson = (index: number) => {
    const updatedList = [...listTransferPerson];

    updatedList.splice(index, 1);

    const filteredPeople = updatedList.filter(
      (person) => parseFloat(person.amount) !== 0 && person.amount !== ''
    );

    const discountPerson =
      (parseFloat(amountDiscount) || 0) / filteredPeople.length;
    const shippingPerson = (parseFloat(shipping) || 0) / filteredPeople.length;

    updatedList.map((person) => {
      if (person.amount) {
        person.discountAmount = Math.round(discountPerson);
        person.moneyAfterReduction = Math.round(
          person.amount - discountPerson + shippingPerson
        );
      } else {
        person.discountAmount = 0;
        person.moneyAfterReduction = 0;
      }
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
    updatedList[index].amount = value;
    setListTransferPerson(updatedList);
    if (parseInt(value) !== 0) {
      calculator();
    }
  };

  useEffect(() => {
    calculator();
  }, [shipping, amountDiscount]);

  const calculator = () => {
    const updatedList = [...listTransferPerson];

    const filteredPeople = listTransferPerson.filter(
      (person) => parseFloat(person.amount) !== 0 && person.amount !== ''
    );

    const discountPerson =
      (parseFloat(amountDiscount) || 0) / filteredPeople.length;
    const shippingPerson = (parseFloat(shipping) || 0) / filteredPeople.length;

    updatedList.map((person) => {
      if (person.amount) {
        person.discountAmount = Math.round(discountPerson);
        person.moneyAfterReduction = Math.round(
          person.amount - discountPerson + shippingPerson
        );
      } else {
        person.discountAmount = 0;
        person.moneyAfterReduction = 0;
      }
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

  const addColumn = () => {
    const updateHeaderTable = [...headerTable];
    const qrIndex = updateHeaderTable.findIndex(
      (item) => item.label === 'Tổng Tiền'
    );
    if (qrIndex !== -1) {
      updateHeaderTable.splice(qrIndex, 0, {
        label: 'new column',
        value: (qrIndex + 1).toString(),
      });
    }

    const updatedList = [...listTransferPerson];
    const newArray = updatedList.map((item) => {
      const newItem = { ...item, [`value-${qrIndex + 1}`]: '0' };

      return newItem;
    });

    setHeaderTable(updateHeaderTable);
    setListTransferPerson(newArray);
  };

  const deleteColumn = (index: any) => {
    const updateHeaderTable = [...headerTable];
    updateHeaderTable.splice(index, 1);
    const updatedList = [...listTransferPerson];
    const columnName = `value-${index + 1}`;
    const newArray = updatedList.map((item) => {
      const newItem = { ...item };

      if (newItem.hasOwnProperty(columnName)) {
        delete newItem[columnName];
      }

      return newItem;
    });
    setHeaderTable(updateHeaderTable);
    setListTransferPerson(newArray);
  };

  const sumTotal = (index: any) => {
    const objectData = listTransferPerson[index];
    const sumValues = Object.entries(objectData).reduce(
      (acc, [key, value]: any) => {
        if (key !== 'mention' && key !== 'amount' && key !== 'discountAmount') {
          return acc + Math.round(parseFloat(value) || 0);
        }
        return acc;
      },
      0
    );
    return sumValues;
  };

  const sumTotalBill = () => {
    const sumValues = listTransferPerson.reduce((acc, objectData) => {
      const partialSum = Object.entries(objectData).reduce(
        (subtotal, [key, value]: any) => {
          if (
            key !== 'mention' &&
            key !== 'amount' &&
            key !== 'discountAmount'
          ) {
            return subtotal + Math.round(parseFloat(value) || 0);
          }
          return subtotal;
        },
        0
      );
      return acc + partialSum;
    }, 0);
    return sumValues;
  };

  const convertTableToMarkdown = (): string => {
    const initHeaderTable = [...headerTable];
    const updatedHeader = initHeaderTable.filter(
      (item) =>
        item.label !== 'Xóa' &&
        item.label !== 'Số tiền' &&
        item.label !== 'Số tiền được giảm giá'
    );

    const headerMarkdown = `| ${updatedHeader
      .map((header: any) => header.label)
      .join(' | ')} |`;

    const separatorMarkdown = `|${Array(updatedHeader.length)
      .fill(' --- ')
      .join('|')}|`;

    const bodyMarkdown = listTransferPerson
      .map((person: any, index) => {
        return `| ${updatedHeader
          .map((header: any, indexColumn) => {
            switch (header.label) {
              case '@':
                return person.mention;
              case 'Số tiền':
                return formatCurrencyVND(
                  Math.round(parseInt(person.amount)) || 0
                );
              case 'Số tiền được giảm giá':
                return formatCurrencyVND(person.discountAmount) || 0;
              case 'Tiền sau khi giảm':
                return formatCurrencyVND(person.moneyAfterReduction);
              case 'Tổng Tiền':
                return formatCurrencyVND(sumTotal(index));
              case 'QR':
                return `![QR Code](https://img.vietqr.io/image/${valueBank}-${valueAccountNumber}-print.png?amount=${sumTotal(
                  index
                )}&accountName=${valueName} =200x256)`;
              default:
                return formatCurrencyVND(
                  Math.round(parseInt(person[`value-${indexColumn + 4}`] ?? 0))
                );
            }
          })
          .join(' | ')} |`;
      })
      .join('\n');
    const bottom = `##### *Tổng số tiền sau khi thanh toán toàn bộ nhận được: ${formatCurrencyVND(
      Math.round(parseInt(sumTotalBill())) || 0
    )} :ohhhh:*`;

    const markdownTable = `\n${headerMarkdown}\n${separatorMarkdown}\n${bodyMarkdown}\n\n${bottom}`;

    return markdownTable;
  };

  const copyScript = () => {
    const markdownTable = convertTableToMarkdown();
    navigator.clipboard.writeText(markdownTable).then(() => {
      setCopied(true);
      toast.success('Copy markdown thành công');
      setTimeout(() => setCopied(false), 2000);
    });
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
          <NumberInput
            label='Tổng số tiền giảm giá'
            onChange={(e) => {
              setAmountDiscount(e ?? '');
            }}
          />

          <NumberInput
            label='Phí Ship'
            onChange={(e) => {
              setShipping(e ?? '');
            }}
          />
        </div>

        <div className='mt-4 flex w-full flex-col gap-4'>
          <div className='text-l italic'>
            Tổng số tiền sau khi thanh toán toàn bộ nhận được:{' '}
            {formatCurrencyVND(Math.round(parseInt(sumTotalBill())) || 0)}
          </div>

          <div className='flex w-full flex-auto flex-row gap-4'>
            <div className='overflow-y-auto'>
              <table className='w-full border-collapse rounded'>
                <tr className='h-[58px] rounded-t bg-gray-100 text-sm font-thin text-gray-400'>
                  {headerTable.map((list, index) => {
                    if (
                      list.label !== 'Xóa' &&
                      list.label !== '@' &&
                      list.label !== 'Số tiền' &&
                      list.label !== 'Số tiền được giảm giá' &&
                      list.label !== 'Tiền sau khi giảm' &&
                      list.label !== 'Tổng Tiền' &&
                      list.label !== 'QR'
                    ) {
                      return (
                        <th
                          key={index}
                          className={cn(
                            index === 0
                              ? 'w-[80px] min-w-[80px]'
                              : 'w-[200px] min-w-[200px]',
                            'border-r'
                          )}
                        >
                          <div className='flex items-center gap-2 text-center'>
                            <Input
                              variant='bordered'
                              className='ml-2 max-w-lg'
                              value={list.label}
                              onChange={(e) => {
                                const updateHeaderTable = [...headerTable];
                                updateHeaderTable[index].label = e.target.value;
                                setHeaderTable(updateHeaderTable);
                              }}
                            />
                            <Button
                              aria-hidden={false}
                              isIconOnly
                              color='danger'
                              aria-label='Like'
                              onClick={() => deleteColumn(index)}
                              className='mr-2'
                            >
                              <Close />
                            </Button>
                          </div>
                        </th>
                      );
                    } else {
                      return (
                        <th
                          key={index}
                          className={cn(
                            index === 0
                              ? 'w-[80px] min-w-[80px]'
                              : 'w-[200px] min-w-[200px]',
                            'border-r text-center'
                          )}
                        >
                          {list.label}
                        </th>
                      );
                    }
                  })}
                </tr>
                {listTransferPerson.map((person, index) => (
                  <tr key={index}>
                    {headerTable.map((header, indexColumn) => {
                      switch (header.label) {
                        case 'Xóa':
                          return (
                            <td className='border-r ' key={indexColumn}>
                              <Button
                                aria-hidden={false}
                                isIconOnly
                                color='danger'
                                aria-label='Like'
                                className='ml-4'
                                isDisabled={listTransferPerson.length <= 1}
                                onClick={() => deletePerson(index)}
                              >
                                <TrashBin />
                              </Button>
                            </td>
                          );

                        case '@':
                          return (
                            <td className='border-r' key={indexColumn}>
                              <Autocomplete
                                defaultItems={Mentions}
                                variant='bordered'
                                label='Mention'
                                labelPlacement='inside'
                                className='mx-2 my-4 w-[90%] max-w-lg'
                                onSelectionChange={(e) =>
                                  changeMention(e, index)
                                }
                                selectedKey={listTransferPerson[index].mention}
                              >
                                {(person) => (
                                  <AutocompleteItem
                                    key={person.value}
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
                            </td>
                          );

                        case 'Số tiền':
                          return (
                            <td className='border-r' key={indexColumn}>
                              <NumberInput
                                label='Số tiền'
                                className='mx-2 !w-[90%] max-w-lg'
                                value={person.amount}
                                onChange={(e) => {
                                  changeAmount(e, index);
                                }}
                              />
                            </td>
                          );

                        case 'Số tiền được giảm giá':
                          return (
                            <td
                              className='border-r text-center'
                              key={indexColumn}
                            >
                              {formatCurrencyVND(person.discountAmount)}
                            </td>
                          );

                        case 'Tiền sau khi giảm':
                          return (
                            <td
                              className='border-r text-center'
                              key={indexColumn}
                            >
                              {formatCurrencyVND(person.moneyAfterReduction)}
                            </td>
                          );
                        case 'Tổng Tiền':
                          return (
                            <td
                              className='border-r text-center'
                              key={indexColumn}
                            >
                              {formatCurrencyVND(sumTotal(index))}
                            </td>
                          );
                        case 'QR':
                          return (
                            <td className='border-r' key={indexColumn}>
                              <Image
                                width={200}
                                alt='NextUI hero Image'
                                src={`https://img.vietqr.io/image/${valueBank}-${valueAccountNumber}-print.png?amount=${sumTotal(
                                  index
                                )}&accountName=${valueName}`}
                              />
                            </td>
                          );

                        default:
                          return (
                            <td key={indexColumn} className='border-r'>
                              <NumberInput
                                label=''
                                className='mx-2 !w-[90%] max-w-lg'
                                value={person[`value-${indexColumn + 1}`]}
                                onChange={(e) => {
                                  const updatedList = [...listTransferPerson];
                                  updatedList[index][
                                    `value-${indexColumn + 1}`
                                  ] = e ?? 0;
                                  setListTransferPerson(updatedList);
                                }}
                              />
                            </td>
                          );
                      }
                    })}
                  </tr>
                ))}
              </table>
            </div>
            <div className='flex'>
              <Button
                aria-hidden={false}
                color='primary'
                className='mt-4'
                startContent={<PlusCircle />}
                onClick={() => addColumn()}
              >
                Thêm cột
              </Button>
            </div>
          </div>

          <div className='text-l italic'>
            Tổng số tiền sau khi thanh toán toàn bộ nhận được:{' '}
            {formatCurrencyVND(Math.round(parseInt(sumTotalBill())) || 0)}
          </div>

          <div className='flex justify-between'>
            <Button
              aria-hidden={false}
              color='primary'
              className='mt-4 max-w-fit'
              startContent={<PlusCircle />}
              onClick={() => addPerson()}
            >
              Thêm dòng
            </Button>
            <Button
              aria-hidden={false}
              color='primary'
              className='mt-4 max-w-fit'
              onClick={copyScript}
              startContent={copied ? <CheckIcon /> : <Copy />}
            >
              Copy markdown
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
