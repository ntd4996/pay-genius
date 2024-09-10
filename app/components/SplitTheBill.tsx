'use client';
import CheckIcon from '@/app/assets/svg/CheckIcon';
import Close from '@/app/assets/svg/Close';
import Copy from '@/app/assets/svg/Copy';
import PlusCircle from '@/app/assets/svg/PlusCircle';
import TrashBin from '@/app/assets/svg/TrashBin';
import NumberInput from '@/app/components/NumberInput';
import { DataBank } from '@/app/data/bank';
import { Mentions } from '@/app/data/mentions';
import axios from '@/app/libs/axios';
import {
  cn,
  formatCurrencyVND,
  getInfoBill,
  sumTotal,
  sumTotalBill,
} from '@/lib/utils';
import {
  Autocomplete,
  AutocompleteItem,
  Avatar,
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Checkbox,
  Image,
  Input,
  Progress,
} from '@nextui-org/react';
import { useMutation } from '@tanstack/react-query';
import React, { useCallback, useEffect, useState, Fragment } from 'react';
import { useForm } from 'react-hook-form';
import Lottie from 'react-lottie';
import { toast } from 'react-toastify';
import QrJson from '@/app/components/lotties/json/qr.json';
import QRLoadingJson from '@/app/components/lotties/json/qr-loading.json';
import { useParams, useRouter } from 'next/navigation';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from './ui/animated-modal';
import { useSession } from 'next-auth/react';

interface SplitTheBillProps {
  breadcrumbs: { name: string; href: string }[];
  isCreate?: boolean;
  dataBill?: any;
}

export default function SplitTheBill({
  breadcrumbs,
  isCreate,
  dataBill,
}: SplitTheBillProps) {
  const {
    register,
    setValue,
    formState: { errors },
  } = useForm({ mode: 'all' });

  const { data } = useSession();

  const isReadOnly = () => {
    if (dataBill?._id) {
      if (data?.user?.email === 'ntd4996@gmail.com') {
        return false;
      }
      if (dataBill?.createBy !== data?.user?.email) {
        return true;
      } else {
        return false;
      }
    }

    return false;
  };

  const router = useRouter();

  const { id } = useParams();

  const [listUsers, setListUsers] = useState<any[]>([]);
  const [selectedKeyName, setSelectedKeyName] = useState<any>('');
  const [selectedKeyBank, setSelectedKeyBank] = useState<any>('');
  const [valueAccountNumber, setValueAccountNumber] = useState<string>('');
  const [valueNameBill, setValueNameBill] = useState<string>('');
  const [amountDiscount, setAmountDiscount] = useState('');
  const [shipping, setShipping] = useState('');
  const [copied, setCopied] = useState(false);
  const [idOrder, setIdOrder] = useState('');

  const [headerTable, setHeaderTable] = useState([
    {
      label: 'Đã thanh toán',
      value: false,
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
    {
      label: 'Xóa',
      value: '1',
    },
  ]);

  const [listTransferPerson, setListTransferPerson] = useState<any[]>([
    {
      mention: '',
      amount: '',
      discountAmount: 0,
      moneyAfterReduction: 0,
      checked: false,
    },
  ]);

  const onSelectionChangeName = (key: React.Key) => {
    const matchingDataAccount = listUsers.find(
      (user) => user.name.toString() === key
    );

    if (matchingDataAccount) {
      setValue('bank', matchingDataAccount.dataBank.label);
      setValue('accountNumber', matchingDataAccount.accountNumber);
      setValueAccountNumber(matchingDataAccount.accountNumber);
      setSelectedKeyBank(matchingDataAccount.dataBank.label);
    }

    setSelectedKeyName(key);
  };

  const onSelectionChangeBank = (key: React.Key) => {
    setSelectedKeyBank(key);
  };

  const onInputChangeAccountNumber = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setValueAccountNumber(event.target.value);
  };

  const onInputChangeNameBill = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setValueNameBill(event.target.value);
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

  const convertTableToMarkdown = (id: string, uid: string): string => {
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
              case 'Đã thanh toán':
                return person.checked ? ':white_check_mark:' : '';
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
                return formatCurrencyVND(sumTotal(listTransferPerson, index));
              case 'QR':
                return `![QR Code](https://img.vietqr.io/image/${selectedKeyBank}-${valueAccountNumber}-print.png?amount=${sumTotal(
                  listTransferPerson,
                  index
                )}&accountName=${selectedKeyName}&addInfo=${getInfoBill(
                  valueNameBill ?? '',
                  uid ?? '',
                  listTransferPerson[index].mention ?? ''
                )} =200x256)`;
              default:
                return formatCurrencyVND(
                  Math.round(parseInt(person[`value-${indexColumn + 4}`] ?? 0))
                );
            }
          })
          .join(' | ')} |`;
      })
      .join('\n');

    const top1 = `##### *Bạn có thể chỉnh sửa và theo dõi thông tin hóa đơn tại: [Link](${window.location.protocol}//${window.location.host}/split-the-bill/${id}) :datnt:*`;

    const top2 = `##### *Tổng số tiền sau khi thanh toán toàn bộ nhận được: ${formatCurrencyVND(
      Math.round(parseInt(sumTotalBill(listTransferPerson))) || 0
    )} :ohhhh:*`;

    const markdownTable = `${top1}\n\n${top2}\n\n${headerMarkdown}\n${separatorMarkdown}\n${bodyMarkdown}\n\n`;

    return markdownTable;
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

  const changeChecked = (value: any, index: number) => {
    const updatedList = [...listTransferPerson];
    updatedList[index].checked = value;
    setListTransferPerson(updatedList);
  };

  const calculator = useCallback(() => {
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
  }, [listTransferPerson, amountDiscount, shipping]);

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

  const addPerson = () => {
    const updatedList = [
      ...listTransferPerson,
      {
        mention: '',
        amount: '',
        discountAmount: 0,
        moneyAfterReduction: 0,
        checked: false,
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

  const createAndCopyMarkdown = async () => {
    const body = {
      headerTable,
      name: selectedKeyName,
      bank: selectedKeyBank,
      accountNumber: valueAccountNumber,
      nameBill: valueNameBill,
      amountDiscount,
      shipping,
      listTransferPerson,
      status: 'unSuccess',
    };
    const isSuccess = listTransferPerson.every((person: any) => person.checked);
    if (!isSuccess) {
      body.status = 'unSuccess';
    } else {
      body.status = 'success';
    }
    if (isCreate) {
      await createBill(body);
    } else {
      await updateBill(body);
    }
  };

  const { mutate: createBill, isPending: isLoadingCreate } = useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post('/api/bill', data);
      return response.data;
    },
    onSuccess: (data) => {
      const markdownTable = convertTableToMarkdown(
        data.bill._id,
        data.bill.uid ?? ''
      );
      navigator.clipboard.writeText(markdownTable).then(() => {
        setCopied(true);
        toast.success('Copy markdown thành công');
        setTimeout(() => setCopied(false), 2000);
      });
      router.push('/split-the-bill/');
    },
    onError: (e) => {
      toast.error('Có lỗi xảy ra');
    },
  });

  const { mutate: updateBill, isPending: isLoadingUpdate } = useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.put(`/api/bill/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      const markdownTable = convertTableToMarkdown(
        data.bill._id,
        data.bill.uid ?? ''
      );
      navigator.clipboard.writeText(markdownTable).then(() => {
        setCopied(true);
        toast.success('Đã cập nhật và Copy markdown thành công');
        setTimeout(() => setCopied(false), 2000);
      });
    },
    onError: (e) => {
      toast.error('Có lỗi xảy ra');
    },
  });

  const { mutate: getAccounts, isPending } = useMutation({
    mutationFn: async () => {
      const response = await axios.get(`/api/accounts`);
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

  useEffect(() => {
    if (!isCreate && dataBill?._id) {
      const {
        name,
        bank,
        accountNumber,
        nameBill,
        amountDiscount,
        shipping,
        listTransferPerson,
        headerTable,
        uid,
      } = dataBill;
      setValue('name', name);
      setValue('bank', bank);
      setValue('accountNumber', accountNumber);
      setValue('nameBill', nameBill);
      setValueAccountNumber(accountNumber);
      setSelectedKeyBank(bank);
      setAmountDiscount(amountDiscount);
      setShipping(shipping);
      setListTransferPerson(listTransferPerson);
      setHeaderTable(headerTable);
      setValueNameBill(nameBill);
      setSelectedKeyName(name);
      setIdOrder(uid);
    }
  }, [dataBill, isCreate, setValue]);

  return (
    <Fragment>
      {isPending && (
        <Progress
          size='sm'
          isIndeterminate
          aria-label='Loading...'
          className='w-full'
        />
      )}
      <div
        className={cn(
          'flex w-full flex-col gap-4',
          'mx-auto max-w-screen-2xl px-5 pb-5 pt-3'
        )}
      >
        <div className='flex items-center justify-between'>
          <Breadcrumbs>
            {breadcrumbs.map((breadcrumb, index) => (
              <BreadcrumbItem href={breadcrumb.href} key={index}>
                {breadcrumb.name}
              </BreadcrumbItem>
            ))}
          </Breadcrumbs>
        </div>

        <div className={cn('flex flex-row gap-4')}>
          <div className='flex h-fit  flex-1 flex-col gap-6 rounded-3xl bg-[#fefefe] p-6'>
            <div className='text-xl font-semibold'>
              Thông tin người hưởng thụ
            </div>
            <Autocomplete
              {...register('name', {
                required: true,
              })}
              aria-hidden={false}
              label='Tên người hưởng thụ'
              variant='bordered'
              defaultItems={listUsers}
              allowsCustomValue={true}
              errorMessage={errors.name && 'Trường này là bắt buộc'}
              isInvalid={!!errors.name}
              isLoading={isPending}
              onSelectionChange={onSelectionChangeName}
              selectedKey={selectedKeyName}
              isRequired
              onKeyDown={(e: any) => e.continuePropagation()}
              isDisabled={isLoadingCreate || isLoadingUpdate || isReadOnly()}
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
              aria-hidden={false}
              label='Ngân hàng'
              labelPlacement='inside'
              {...register('bank', {
                required: true,
              })}
              errorMessage={errors.bank && 'Trường này là bắt buộc'}
              isInvalid={!!errors.bank}
              isRequired
              selectedKey={selectedKeyBank}
              onKeyDown={(e: any) => e.continuePropagation()}
              onSelectionChange={onSelectionChangeBank}
              isDisabled={isLoadingCreate || isLoadingUpdate || isReadOnly()}
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
              aria-hidden={false}
              label='Số tài khoản'
              variant='bordered'
              isInvalid={!!errors.accountNumber}
              errorMessage={errors.accountNumber && 'Trường này là bắt buộc'}
              onChange={onInputChangeAccountNumber}
              value={valueAccountNumber}
              isDisabled={isLoadingCreate || isLoadingUpdate || isReadOnly()}
            />

            <hr />
            <Input
              {...register('nameBill', {
                required: true,
              })}
              isRequired
              aria-hidden={false}
              label='Tên hóa đơn'
              variant='bordered'
              isInvalid={!!errors.nameBill}
              errorMessage={errors.nameBill && 'Trường này là bắt buộc'}
              onChange={onInputChangeNameBill}
              value={valueNameBill}
              isDisabled={isLoadingCreate || isLoadingUpdate || isReadOnly()}
            />
            <hr />

            <div
              className={cn(
                'flex items-center justify-center gap-4',
                isReadOnly() && 'opacity-disabled'
              )}
            >
              <NumberInput
                label='Tổng số tiền giảm giá'
                value={amountDiscount}
                onChange={(e) => {
                  setAmountDiscount(e ?? '');
                  calculator();
                }}
                isDisabled={isLoadingCreate || isLoadingUpdate || isReadOnly()}
              />

              <NumberInput
                label='Phí Ship'
                value={shipping}
                onChange={(e) => {
                  setShipping(e ?? '');
                  calculator();
                }}
                isDisabled={isLoadingCreate || isLoadingUpdate || isReadOnly()}
              />
            </div>
          </div>

          <div className='flex w-[400px] flex-col items-center justify-center gap-6 rounded-3xl bg-[#FEFEFE] p-4'>
            {selectedKeyBank && valueAccountNumber && selectedKeyName ? (
              <Image
                width={300}
                alt='QR Image'
                src={`https://img.vietqr.io/image/${selectedKeyBank}-${valueAccountNumber}-print.png?accountName=${selectedKeyName}&addInfo=${getInfoBill(
                  valueNameBill ?? '',
                  idOrder ?? '',
                  ''
                )}`}
              />
            ) : (
              <div>
                <Lottie
                  options={{
                    loop: true,
                    autoplay: true,
                    animationData: QrJson,
                    rendererSettings: {
                      preserveAspectRatio: 'xMidYMid slice',
                    },
                  }}
                  width={300}
                  height={300}
                />
              </div>
            )}
          </div>
        </div>

        <div className='flex h-fit  flex-1 flex-col gap-6 rounded-3xl bg-[#fefefe] p-6'>
          <div className='flex w-full flex-auto flex-row gap-4'>
            <div className='flex-1 overflow-y-auto'>
              <table className='w-full border-collapse rounded'>
                <thead>
                  <tr className='h-[58px] rounded-t bg-gray-100 text-sm font-thin text-gray-400'>
                    {headerTable.map((list, index) => {
                      if (
                        list.label !== 'Đã thanh toán' &&
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
                              index === headerTable.length - 1
                                ? 'w-[80px] min-w-[80px]'
                                : 'w-[200px] min-w-[200px]',
                              'border-r'
                            )}
                          >
                            <div className='flex items-center gap-2 text-center'>
                              <Input
                                variant='bordered'
                                aria-hidden={false}
                                className='ml-2 max-w-lg'
                                value={list.label}
                                onChange={(e) => {
                                  const updateHeaderTable = [...headerTable];
                                  updateHeaderTable[index].label =
                                    e.target.value;
                                  setHeaderTable(updateHeaderTable);
                                }}
                                isDisabled={
                                  isLoadingCreate ||
                                  isLoadingUpdate ||
                                  isReadOnly()
                                }
                              />
                              {isReadOnly() ? (
                                ''
                              ) : (
                                <Button
                                  isIconOnly
                                  color='danger'
                                  aria-label='Like'
                                  onClick={() => deleteColumn(index)}
                                  className='mr-2'
                                >
                                  <Close />
                                </Button>
                              )}
                            </div>
                          </th>
                        );
                      } else if (list.label === 'Đã thanh toán') {
                        return (
                          <th
                            key={index}
                            className={cn(
                              'w-fit',
                              'min-w-[119px] border-r text-center'
                            )}
                          >
                            {list.label}
                          </th>
                        );
                      } else {
                        return (
                          <th
                            key={index}
                            className={cn(
                              index === headerTable.length - 1
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
                </thead>
                <tbody>
                  {listTransferPerson.map((person, index) => (
                    <tr key={index}>
                      {headerTable.map((header, indexColumn) => {
                        switch (header.label) {
                          case 'Đã thanh toán':
                            return (
                              <td
                                className='h-full border-r text-center'
                                key={indexColumn}
                              >
                                <Checkbox
                                  isSelected={listTransferPerson[index].checked}
                                  aria-hidden={false}
                                  onValueChange={(e) => {
                                    changeChecked(e, index);
                                  }}
                                  isDisabled={isReadOnly()}
                                ></Checkbox>
                              </td>
                            );
                          case 'Xóa':
                            return (
                              <td className='border-r ' key={indexColumn}>
                                <Button
                                  isIconOnly
                                  color='danger'
                                  aria-label='Like'
                                  className='ml-4'
                                  isDisabled={
                                    listTransferPerson.length <= 1 ||
                                    isReadOnly()
                                  }
                                  onClick={() => deletePerson(index)}
                                  isLoading={isLoadingCreate || isLoadingUpdate}
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
                                  selectedKey={
                                    listTransferPerson[index].mention
                                  }
                                  isDisabled={
                                    isLoadingCreate ||
                                    isLoadingUpdate ||
                                    isReadOnly()
                                  }
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
                                  isDisabled={
                                    isLoadingCreate ||
                                    isLoadingUpdate ||
                                    isReadOnly()
                                  }
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
                                {formatCurrencyVND(
                                  sumTotal(listTransferPerson, index)
                                )}
                              </td>
                            );
                          case 'QR':
                            return (
                              <td className='border-r' key={indexColumn}>
                                {selectedKeyBank &&
                                valueAccountNumber &&
                                selectedKeyName ? (
                                  <Image
                                    width={200}
                                    alt='NextUI hero Image'
                                    src={`https://img.vietqr.io/image/${selectedKeyBank}-${valueAccountNumber}-print.png?amount=${sumTotal(
                                      listTransferPerson,
                                      index
                                    )}&accountName=${selectedKeyName}&addInfo=${getInfoBill(
                                      valueNameBill ?? '',
                                      idOrder ?? '',
                                      listTransferPerson[index].mention ?? ''
                                    )}`}
                                  />
                                ) : (
                                  <div>
                                    <Lottie
                                      options={{
                                        loop: true,
                                        autoplay: true,
                                        animationData: QRLoadingJson,
                                        rendererSettings: {
                                          preserveAspectRatio: 'xMidYMid slice',
                                        },
                                      }}
                                      width={200}
                                      height={200}
                                    />
                                  </div>
                                )}
                              </td>
                            );

                          default:
                            return (
                              <td key={indexColumn} className='border-r'>
                                <NumberInput
                                  label='Số tiền'
                                  className='mx-2 !w-[90%] max-w-lg'
                                  value={person[`value-${indexColumn + 1}`]}
                                  onChange={(e) => {
                                    const updatedList = [...listTransferPerson];
                                    updatedList[index][
                                      `value-${indexColumn + 1}`
                                    ] = e ?? 0;
                                    setListTransferPerson(updatedList);
                                  }}
                                  isDisabled={
                                    isLoadingCreate ||
                                    isLoadingUpdate ||
                                    isReadOnly()
                                  }
                                />
                              </td>
                            );
                        }
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!isReadOnly() && (
              <div className='flex'>
                <Button
                  color='primary'
                  className='mt-4'
                  startContent={<PlusCircle />}
                  onClick={() => addColumn()}
                  isIconOnly
                  isDisabled={
                    isLoadingCreate || isLoadingUpdate || isReadOnly()
                  }
                />
              </div>
            )}
          </div>

          <div className='text-md italic text-slate-500'>
            Tổng số tiền sau khi thanh toán toàn bộ nhận được:{' '}
            {formatCurrencyVND(
              Math.round(parseInt(sumTotalBill(listTransferPerson))) || 0
            )}
          </div>
          {!isReadOnly() && (
            <div className='flex justify-between'>
              <Button
                color='primary'
                className='mt-4 max-w-fit'
                onClick={() => addPerson()}
                isDisabled={isLoadingCreate || isLoadingUpdate || isReadOnly()}
              >
                Thêm dòng
              </Button>

              <div className='flex items-end gap-4'>
                {!isReadOnly() && !isCreate && (
                  <Modal>
                    <ModalTrigger>
                      <div className='flex h-10 items-center justify-center gap-3 rounded-xl bg-danger px-4 text-sm text-white outline-none'>
                        <TrashBin />
                        Xóa hóa đơn
                      </div>
                    </ModalTrigger>

                    <ModalBody>
                      <ModalContent>
                        <div className='text-center text-lg'>
                          Bạn có chắc chắn muốn xóa hóa đơn này không?
                        </div>
                      </ModalContent>
                      <ModalFooter className='gap-4' id={id} />
                    </ModalBody>
                  </Modal>
                )}

                <Button
                  color='primary'
                  className='mt-4 max-w-fit'
                  onClick={createAndCopyMarkdown}
                  startContent={copied ? <CheckIcon /> : <Copy />}
                  isDisabled={
                    !selectedKeyBank ||
                    !valueAccountNumber ||
                    !selectedKeyName ||
                    !valueNameBill ||
                    isReadOnly()
                  }
                  isLoading={isLoadingCreate || isLoadingUpdate}
                >
                  {isCreate
                    ? 'Tạo mới và Copy markdown'
                    : 'Lưu và Copy markdown'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Fragment>
  );
}
