'use client';
import React, { Fragment, useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardBody,
  Input,
  Button,
  RadioGroup,
  Radio,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  cn,
  Image,
} from '@nextui-org/react';
import PlusCircle from '../assets/svg/PlusCircle';
import TrashBin from '../assets/svg/TrashBin';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import { DataBank } from '../data/bank';
import { ToastContainer, toast } from 'react-toastify';
import Copy from '../assets/svg/Copy';
import CheckIcon from '../assets/svg/CheckIcon';

type TypeTransferPerson = {
  name: string;
  amount: string;
  addInfo: string;
};

type FieldName = 'name' | 'amount' | 'addInfo';

export default function DivideByEachPerson() {
  const [copied, setCopied] = useState(false);

  const [listTransferPerson, setListTransferPerson] = useState<
    TypeTransferPerson[]
  >([
    {
      name: '',
      amount: '',
      addInfo: '',
    },
  ]);
  const [listTransferPersonData, setListTransferPersonData] = useState<
    TypeTransferPerson[]
  >([]);
  const [dataRender, setDataRender] = useState({
    accountNumber: '',
    codeBank: {
      label: '',
    },
    discountAmount: '',
    nameOfTheFirstInput: '',
    shippingAmount: '',
    feesApply: '',
    round: '',
    totalBill: '',
    transferPerson: [],
  });

  const handleFieldChange = (
    index: number,
    fieldName: FieldName,
    newValue: string
  ) => {
    const updatedListTransferPerson = [...listTransferPerson];
    if (index >= 0 && index < updatedListTransferPerson.length) {
      updatedListTransferPerson[index][fieldName] = newValue;
      setListTransferPerson(updatedListTransferPerson);
    }
  };

  const addPerson = () => {
    setListTransferPerson([
      ...listTransferPerson,
      {
        name: '',
        amount: '',
        addInfo: '',
      },
    ]);
  };

  const deletePerson = (index: number) => {
    const updatedListTransferPerson = [...listTransferPerson];

    if (index >= 0 && index < updatedListTransferPerson.length) {
      updatedListTransferPerson.splice(index, 1);
      setListTransferPerson(updatedListTransferPerson);
    }
  };

  const checkTotalAmountEqual = (
    totalBill: string,
    transferPerson: { amount: string }[]
  ): boolean => {
    const totalAmount = transferPerson.reduce(
      (acc, transfer) => acc + parseInt(transfer.amount, 10),
      0
    );

    return totalAmount === parseInt(totalBill, 10);
  };

  const convertPrice = (price: string): string => {
    const shippingAmount = dataRender.shippingAmount
      ? parseInt(dataRender.shippingAmount)
      : 0;
    const feesApply = dataRender.feesApply ? parseInt(dataRender.feesApply) : 0;
    const sum = shippingAmount + feesApply;
    if (dataRender.discountAmount && parseInt(price) > 0) {
      if (sum) {
        const discount =
          parseInt(price) -
          parseInt(dataRender.discountAmount) / listTransferPersonData.length +
          sum / listTransferPersonData.length;

        return discount.toString();
      } else {
        const discount =
          parseInt(price) -
          parseInt(dataRender.discountAmount) / listTransferPersonData.length;

        return discount.toString();
      }
    }
    if (sum) {
      return (parseInt(price) + sum / listTransferPersonData.length).toString();
    } else {
      return price;
    }
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: 'all' });
  const onSubmit = async (data: any) => {
    console.log(data);
    const isTotalAmountEqual = checkTotalAmountEqual(
      data.totalBill,
      listTransferPerson
    );
    if (isTotalAmountEqual) {
      await setDataRender(data);
      await setListTransferPersonData([...listTransferPerson]);
    } else {
      await setListTransferPersonData([]);
      toast.error(
        'Tổng số tiền người chuyển khoản không bằng tổng số tiền hóa đơn!'
      );
    }
  };

  const sumPrice = useMemo<number>(() => {
    const totalBill = dataRender?.totalBill
      ? parseInt(dataRender?.totalBill)
      : 0;
    const feesApply = dataRender?.feesApply
      ? parseInt(dataRender?.feesApply)
      : 0;
    const shippingAmount = dataRender?.shippingAmount
      ? parseInt(dataRender?.shippingAmount)
      : 0;
    const discountAmount = dataRender?.discountAmount
      ? parseInt(dataRender?.discountAmount)
      : 0;

    const sum = totalBill + feesApply + shippingAmount - discountAmount;
    return parseInt(sum.toString()) ?? 0;
  }, [dataRender]);

  const generateMarkdownTable = () => {
    const markdownRows = listTransferPersonData.map(
      (person) =>
        `| ${person.name} | ${
          person.amount
        } | ![son](https://img.vietqr.io/image/${dataRender.codeBank?.label}-${
          dataRender.accountNumber
        }-print.png?amount=${convertPrice(person.amount)}&accountName=${
          dataRender.nameOfTheFirstInput
        }&addInfo=${person.addInfo} =200x200) |`
    );

    const markdownTable = `| Tên người | Số tiền | Mã QR | \n|-----------|---------|-------|------------|\n${markdownRows.join(
      '\n'
    )}`;

    return markdownTable;
  };

  const copyScript = () => {
    const markdownTable = generateMarkdownTable();
    navigator.clipboard.writeText(markdownTable).then(() => {
      setCopied(true);
      toast.success('Copy markdown thành công');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Card>
      <ToastContainer />
      <CardBody>
        <div className='flex w-full flex-col justify-start gap-14 lg:flex-row'>
          <div className='flex min-w-fit flex-col gap-4 lg:max-w-xs'>
            <div className='text-xl font-semibold'>
              Thông tin người hưởng thụ
            </div>
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
              name='nameOfTheFirstInput'
              control={control}
              rules={{ required: 'Trường này là bắt buộc' }}
              render={({ field }) => (
                <Input
                  variant='bordered'
                  isRequired
                  label='Tên người hưởng thụ'
                  value={field.value}
                  onChange={field.onChange}
                  classNames={{
                    inputWrapper: errors.nameOfTheFirstInput && 'border-danger',
                    label: ['z-1'],
                  }}
                  errorMessage={
                    errors.nameOfTheFirstInput && 'Trường này là bắt buộc'
                  }
                />
              )}
            />
            <Controller
              name='accountNumber'
              control={control}
              rules={{ required: 'Trường này là bắt buộc' }}
              render={({ field }) => (
                <Input
                  variant='bordered'
                  isRequired
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

            <Controller
              name='totalBill'
              control={control}
              rules={{ required: 'Trường này là bắt buộc' }}
              render={({ field }) => (
                <Input
                  variant='bordered'
                  isRequired
                  label='Tổng hóa đơn'
                  value={field.value}
                  onChange={field.onChange}
                  classNames={{
                    inputWrapper: errors.totalBill && 'border-danger',
                    label: ['z-1'],
                  }}
                  errorMessage={errors.totalBill && 'Trường này là bắt buộc'}
                />
              )}
            />
            <Controller
              name='shippingAmount'
              control={control}
              render={({ field }) => (
                <Input
                  variant='bordered'
                  label='Phí giao hàng'
                  type='number'
                  value={field.value}
                  onChange={field.onChange}
                  classNames={{
                    inputWrapper: errors.discountAmount && 'border-danger',
                    label: ['z-1'],
                  }}
                  errorMessage={
                    errors.discountAmount && 'Trường này là bắt buộc'
                  }
                />
              )}
            />
            <Controller
              name='feesApply'
              control={control}
              render={({ field }) => (
                <Input
                  variant='bordered'
                  label='Phí áp dụng'
                  type='number'
                  value={field.value}
                  onChange={field.onChange}
                  classNames={{
                    inputWrapper: errors.discountAmount && 'border-danger',
                    label: ['z-1'],
                  }}
                  errorMessage={
                    errors.discountAmount && 'Trường này là bắt buộc'
                  }
                />
              )}
            />
            <Controller
              name='discountAmount'
              control={control}
              render={({ field }) => (
                <Input
                  variant='bordered'
                  label='Số tiền giảm giá'
                  type='number'
                  value={field.value}
                  onChange={field.onChange}
                  classNames={{
                    inputWrapper: errors.discountAmount && 'border-danger',
                    label: ['z-1'],
                  }}
                  errorMessage={
                    errors.discountAmount && 'Trường này là bắt buộc'
                  }
                />
              )}
            />
          </div>

          <div className='flex w-full flex-col gap-4'>
            <div className='text-xl font-semibold'>
              Thông tin người chuyển khoản
            </div>
            <div className='flex flex-col gap-4'>
              {listTransferPerson.map(
                (transferPerson: TypeTransferPerson, index) => (
                  <div
                    className='flex flex-col items-start gap-4 border-b pb-4 lg:flex-row'
                    key={index}
                  >
                    <Controller
                      name={`transferPerson[${index}].name`}
                      control={control}
                      defaultValue={transferPerson.name}
                      rules={{ required: 'Trường này là bắt buộc' }}
                      render={({ field }) => (
                        <Input
                          variant='bordered'
                          label={`Tên người chuyển khoản thứ ${index + 1}`}
                          isRequired
                          className='w-full'
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e);
                            handleFieldChange(index, 'name', e.target.value);
                          }}
                          classNames={{
                            inputWrapper: [
                              Array.isArray(errors?.transferPerson) &&
                                errors?.transferPerson[index]?.name &&
                                'border-danger',
                            ],
                            label: ['z-1'],
                          }}
                          errorMessage={
                            Array.isArray(errors?.transferPerson) &&
                            errors?.transferPerson[index]?.name &&
                            errors?.transferPerson[index]?.name.message
                          }
                        />
                      )}
                    />

                    <Controller
                      name={`transferPerson[${index}].amount`}
                      control={control}
                      defaultValue={transferPerson.amount}
                      rules={{ required: 'Trường này là bắt buộc' }}
                      render={({ field }) => (
                        <Input
                          variant='bordered'
                          label='Số tiền chưa trừ khuyến mại'
                          isRequired
                          className='w-full'
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e);
                            handleFieldChange(index, 'amount', e.target.value);
                          }}
                          type='number'
                          classNames={{
                            inputWrapper: [
                              Array.isArray(errors?.transferPerson) &&
                                errors?.transferPerson[index]?.amount &&
                                'border-danger',
                            ],
                            label: ['z-1'],
                          }}
                          errorMessage={
                            Array.isArray(errors?.transferPerson) &&
                            errors?.transferPerson[index]?.amount &&
                            errors?.transferPerson[index]?.amount.message
                          }
                        />
                      )}
                    />

                    <Controller
                      name={`transferPerson[${index}].addInfo`}
                      control={control}
                      defaultValue={transferPerson.addInfo}
                      rules={{ required: 'Trường này là bắt buộc' }}
                      render={({ field }) => (
                        <Input
                          variant='bordered'
                          label='Nội dung chuyển khoản'
                          isRequired
                          className='w-full'
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e);
                            handleFieldChange(index, 'addInfo', e.target.value);
                          }}
                          classNames={{
                            inputWrapper: [
                              Array.isArray(errors?.transferPerson) &&
                                errors?.transferPerson[index]?.addInfo &&
                                'border-danger',
                            ],
                            label: ['z-1'],
                          }}
                          errorMessage={
                            Array.isArray(errors?.transferPerson) &&
                            errors?.transferPerson[index]?.addInfo &&
                            errors?.transferPerson[index]?.addInfo.message
                          }
                        />
                      )}
                    />

                    <div className='flex h-full items-center justify-center'>
                      <Button
                        isIconOnly
                        color='danger'
                        aria-label='Like'
                        isDisabled={listTransferPerson.length <= 1}
                        onClick={() => deletePerson(index)}
                      >
                        <TrashBin />
                      </Button>
                    </div>
                  </div>
                )
              )}
            </div>

            <div className='flex w-full justify-end'>
              <Button
                color='primary'
                startContent={<PlusCircle />}
                onClick={addPerson}
              >
                Thêm người chuyển khoản
              </Button>
            </div>
          </div>
        </div>
        <div className='mt-4 italic text-gray-500'>
          Tổng số tiền thực nhận là: {sumPrice ?? 0} VNĐ
        </div>
        <div className='mt-4 flex w-full items-center justify-start'>
          <Button color='primary' onClick={handleSubmit(onSubmit)}>
            Cập nhật Review
          </Button>
        </div>
        <hr className='my-4' />
        <div className='flex w-full flex-col gap-4'>
          <div className='flex w-full items-center justify-between'>
            <div className='text-xl font-semibold'>Review</div>
            <Button
              color='primary'
              onClick={copyScript}
              startContent={copied ? <CheckIcon /> : <Copy />}
              isDisabled={listTransferPersonData.length === 0}
            >
              Copy markdown
            </Button>
          </div>
          <Table aria-label='Example static collection table'>
            <TableHeader>
              <TableColumn className='w-[200px]'>
                Người chuyển khoản
              </TableColumn>
              <TableColumn className='w-[200px]'>Số tiền</TableColumn>
              <TableColumn className='w-[200px] text-center'>Mã QR</TableColumn>
            </TableHeader>
            <TableBody>
              {listTransferPersonData.map((person: any, index) => (
                <TableRow key={index}>
                  <TableCell>{person.name}</TableCell>
                  <TableCell>{person.amount}</TableCell>
                  <TableCell className='flex w-full justify-center'>
                    <Image
                      width={200}
                      alt='NextUI hero Image'
                      src={`https://img.vietqr.io/image/${dataRender.codeBank
                        ?.label}-${
                        dataRender.accountNumber
                      }-print.png?amount=${convertPrice(
                        person.amount
                      )}&accountName=${
                        dataRender.nameOfTheFirstInput
                      }&addInfo=${person.addInfo}`}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardBody>
    </Card>
  );
}
