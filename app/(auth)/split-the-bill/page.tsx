'use client';

import {
  Chip,
  ChipProps,
  cn,
  Image,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from '@/app/libs/axios';
import PlantOne from '@/app/assets/svg/plans/PlantOne';
import PlantFive from '@/app/assets/svg/plans/PlantFive';
import PlantSix from '@/app/assets/svg/plans/PlantSix';
import PlantTen from '@/app/assets/svg/plans/PlantTen';
import ShinyButton from '@/app/components/ui/button-custom';
import CheckBadge from '@/app/assets/svg/CheckBadge';
import Clock from '@/app/assets/svg/Clock';
import BankNotes from '@/app/assets/svg/BankNotes';
import { AnimatedListExport } from '@/app/components/ui/AnimatedList';
import Edit from '@/app/assets/svg/Edit';
import dayjs from 'dayjs';
import NoData from '@/app/components/lotties/json/no-data.json';
import Lottie from 'react-lottie';
import { useRouter } from 'next/navigation';

const statusColorMap: Record<string, ChipProps['color']> = {
  success: 'success',
  unsuccessful: 'warning',
};

export default function Home() {
  const { data: session } = useSession();
  const name = session?.user?.name;
  const router = useRouter();

  // const { mutate: postData } = useMutation({
  //   mutationFn: async () => {
  //     const response = await axios.get(`/api/auth/me`);
  //     return response;
  //   },
  //   onSuccess: (data) => {},
  //   onError: (e) => {},
  // });

  // useEffect(() => {
  //   postData();
  // }, []);

  const renderStatus = (status: string) => {
    switch (status) {
      case 'unsuccessful':
        return (
          <Chip
            className='capitalize'
            color={statusColorMap['unsuccessful']}
            size='sm'
            variant='flat'
          >
            Chưa hoàn thành
          </Chip>
        );

      default:
        return (
          <Chip
            className='capitalize'
            color={statusColorMap['success']}
            size='sm'
            variant='flat'
          >
            Hoàn thành
          </Chip>
        );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // use dayjs to format date
  const formatDate = (date: string) => {
    if (!date) return '';
    return dayjs(date).format('DD/MM/YYYY HH:mm');
  };

  const renderCell = useCallback((data: any, columnKey: React.Key) => {
    return '123';
    // const cellValue = user[columnKey as keyof User];

    // switch (columnKey) {
    //   case 'name':
    //     return (
    //       <User
    //         avatarProps={{ radius: 'lg', src: user.avatar }}
    //         description={user.email}
    //         name={cellValue}
    //       >
    //         {user.email}
    //       </User>
    //     );
    //   case 'role':
    //     return (
    //       <div className='flex flex-col'>
    //         <p className='text-bold text-small capitalize'>{cellValue}</p>
    //         <p className='text-bold text-tiny capitalize text-default-400'>
    //           {user.team}
    //         </p>
    //       </div>
    //     );
    //   case 'status':
    //     return (
    //       <Chip
    //         className='capitalize'
    //         color={statusColorMap[user.status]}
    //         size='sm'
    //         variant='flat'
    //       >
    //         {cellValue}
    //       </Chip>
    //     );
    //   case 'actions':
    //     return (
    //       <div className='relative flex items-center justify-end gap-2'>
    //         <Dropdown>
    //           <DropdownTrigger>
    //             <Button isIconOnly size='sm' variant='light'>
    //               <VerticalDotsIcon className='text-default-300' />
    //             </Button>
    //           </DropdownTrigger>
    //           <DropdownMenu>
    //             <DropdownItem>View</DropdownItem>
    //             <DropdownItem>Edit</DropdownItem>
    //             <DropdownItem>Delete</DropdownItem>
    //           </DropdownMenu>
    //         </Dropdown>
    //       </div>
    //     );
    //   default:
    //     return cellValue;
    // }
  }, []);

  const redirectToCreate = () => {
    router.push('/split-the-bill/create');
  };

  return (
    <div className='isolate mx-auto flex min-h-full-screen flex-col'>
      <div
        className={cn('flex w-full flex-col', 'mx-auto max-w-screen-2xl p-5')}
      >
        <div className='flex w-full flex-col '>
          <div className='flex min-h-full-content gap-6'>
            <div className='flex flex-1 flex-col gap-6 rounded-3xl bg-[#FEFEFE] p-4'>
              <Image src={'/images/banner.png'} alt='banner' height={300} />

              <div className='flex flex-col gap-4'>
                <div className='flex items-center justify-between'>
                  <div className='text-2xl'>Thông tin các hóa đơn</div>
                  <div onClick={redirectToCreate}>
                    <ShinyButton text='tạo hóa đơn' className='px-6 py-3' />
                  </div>
                </div>
                <Table
                  isCompact
                  removeWrapper
                  classNames={{
                    th: 'bg-[#f4f4f4] uppercase text-[#191a1f] font-semibold',
                    tr: 'hover:bg-[#f4f4f4] h-[50px] rounded-3xl',
                  }}
                >
                  <TableHeader>
                    <TableColumn>Tên hóa đơn</TableColumn>
                    <TableColumn>Tổng số tiền</TableColumn>
                    <TableColumn>Trạng thái</TableColumn>
                    <TableColumn>Ngày Tạo</TableColumn>
                    <TableColumn>&nbsp;</TableColumn>
                  </TableHeader>
                  <TableBody
                    emptyContent={
                      <div className='flex items-center justify-center'>
                        <Lottie
                          options={{
                            loop: true,
                            autoplay: true,
                            animationData: NoData,
                            rendererSettings: {
                              preserveAspectRatio: 'xMidYMid slice',
                            },
                          }}
                          height={40}
                          width={40}
                          style={{
                            width: '400px',
                            height: '400px',
                            margin: '0',
                            minWidth: '200px',
                          }}
                        />
                      </div>
                    }
                    items={[] as any}
                  >
                    {(item: any) => (
                      <TableRow key={item.id}>
                        {(columnKey) => (
                          <TableCell>{renderCell(item, columnKey)}</TableCell>
                        )}
                      </TableRow>
                    )}
                    {/* <TableRow key='1'>
                      <TableCell>Thành Đạt Nguyễn</TableCell>
                      <TableCell>{formatCurrency(200000)}</TableCell>
                      <TableCell>{renderStatus('unsuccessful')}</TableCell>
                      <TableCell>{formatDate(dayjs().format())}</TableCell>
                      <TableCell>
                        <Edit className='cursor-pointer hover:text-primary' />
                      </TableCell>
                    </TableRow>
                    <TableRow key='2'>
                      <TableCell>Tony Reichert</TableCell>
                      <TableCell>{formatCurrency(140000)}</TableCell>
                      <TableCell>{renderStatus('success')}</TableCell>
                      <TableCell>Active</TableCell>
                      <TableCell className='text-center'>
                        <Edit className='cursor-pointer hover:text-primary' />
                      </TableCell>
                    </TableRow> */}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div
              className={cn(
                'w-1/3 rounded-3xl bg-[#FEFEFE] p-4',
                'flex flex-col gap-6'
              )}
            >
              <div className='relative flex flex-col gap-6 overflow-hidden rounded-3xl border px-4 py-10'>
                <div className='text-center text-2xl font-semibold'>
                  Chúc một ngày tốt lành,
                  <br />
                  {name} 👋
                </div>
                <div className='text-center'>
                  QR-Payshare
                  <br /> Chia đều hóa đơn, sẻ chia dễ dàng!
                </div>
                <div
                  className='flex items-center justify-center'
                  onClick={redirectToCreate}
                >
                  <ShinyButton text='tạo hóa đơn' className='px-6 py-3' />
                </div>
                <div className='absolute left-2 top-3/4 w-[60px] rotate-45'>
                  <PlantFive />
                </div>
                <div className='absolute right-2 top-1/3 w-[80px] -rotate-45'>
                  <PlantSix />
                </div>
              </div>

              <div className='relative flex  flex-col items-center justify-center gap-6 overflow-hidden rounded-3xl border  py-10'>
                <div className='flex flex-col gap-6'>
                  <div className='flex items-center gap-2 text-xl'>
                    <BankNotes className='text-primary-500' />
                    <div>
                      Bạn đã tạo <span className='text-3xl'>0</span> hóa đơn
                    </div>
                  </div>
                  <div className='text-xl'>
                    <div className='flex items-center gap-2 text-xl'>
                      <CheckBadge className='text-success-500' />
                      <div>
                        Đã có <span className='text-3xl'>0</span> hóa đơn đã
                        hoàn thành
                      </div>
                    </div>
                  </div>

                  <div className='text-xl'>
                    <div className='flex items-center gap-2 text-xl'>
                      <Clock className='text-primary' />
                      <div>
                        Còn <span className='text-3xl'>0</span> hóa đơn chưa
                        hoàn thành
                      </div>
                    </div>
                  </div>
                </div>
                <div className='absolute bottom-[5px] left-2 w-[55px] rotate-45'>
                  <PlantTen />
                </div>
                <div className='absolute right-2 top-[10px] w-[60px] -rotate-45'>
                  <PlantOne />
                </div>
              </div>

              <div className='relative flex h-card-message  flex-col gap-6 overflow-hidden rounded-3xl border px-4 py-10'>
                <AnimatedListExport />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
