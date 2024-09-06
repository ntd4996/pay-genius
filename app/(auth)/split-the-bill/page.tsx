'use client';

import {
  Button,
  Chip,
  ChipProps,
  cn,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Image,
  Input,
  Pagination,
  Progress,
  Selection,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react';
import { useSession } from 'next-auth/react';
import { Fragment, useCallback, useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import axios from '@/app/libs/axios';
import PlantOne from '@/app/assets/svg/plans/PlantOne';
import PlantFive from '@/app/assets/svg/plans/PlantFive';
import PlantSix from '@/app/assets/svg/plans/PlantSix';
import PlantTen from '@/app/assets/svg/plans/PlantTen';
import ShinyButton from '@/app/components/ui/button-custom';
import CheckBadge from '@/app/assets/svg/CheckBadge';
import Clock from '@/app/assets/svg/Clock';
import BankNotes from '@/app/assets/svg/BankNotes';
import dayjs from 'dayjs';
import NoData from '@/app/components/lotties/json/no-data.json';
import Lottie from 'react-lottie';
import { useRouter } from 'next/navigation';
import { SearchIcon } from '@/app/assets/svg/SearchIcon';
import listJson from '@/app/components/lotties/json/list.json';
import loadingEarthJson from '@/app/components/lotties/json/loading-earth.json';

const statusColorMap: Record<string, ChipProps['color']> = {
  success: 'success',
  unsuccessful: 'warning',
};
import { useDebounce } from 'use-debounce';
import { ChevronDownIcon } from '@/app/assets/svg/ChevronDownIcon';
import { statusOptions } from '@/app/data/status';
import { AnimatedTooltip } from '@/app/components/ui/animated-tooltip';

const DEBOUNCE_MS = 300;

export default function Home() {
  const { data: session } = useSession();
  const name = session?.user?.name;
  const router = useRouter();
  const [listData, setListData] = useState([]);
  const [totalBill, setTotalBill] = useState(0);
  const [totalBillSuccess, setTotalBillSuccess] = useState(0);
  const [totalBillUnSuccess, setTotalBillUnSuccess] = useState(0);
  const [page, setPage] = useState(1);
  const [filterValue, setFilterValue] = useState('');
  const [debouncedQuery] = useDebounce(filterValue, DEBOUNCE_MS);
  const [statusFilter, setStatusFilter] = useState<Selection>('all');
  const [key, setKey] = useState(0);
  const [listMentionBills, setListMentionBills] = useState([]);

  const { isLoading, refetch } = useQuery({
    queryKey: [`get-list-bill`, page, debouncedQuery, key],
    queryFn: async () => {
      let url = '/api/bill?page=' + page + '&search=' + debouncedQuery;
      if (statusFilter !== 'all' && Array.from(statusFilter).length <= 1) {
        url += '&status=' + Array.from(statusFilter).join(',');
      }
      const result = await axios(url);
      const data = result.data;
      setTotalBill(data.totalBills ? parseInt(data.totalBills) : 0);
      setTotalBillSuccess(data.totalChecked ? parseInt(data.totalChecked) : 0);
      setTotalBillUnSuccess(
        data.totalUnChecked ? parseInt(data.totalUnChecked) : 0
      );
      setListData(data.bills ?? []);
      setListMentionBills(data.listMentionBills ?? []);
      return data.bills;
    },
    staleTime: DEBOUNCE_MS,
    placeholderData: keepPreviousData,
  });

  const onSearchChange = useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue('');
      setPage(1);
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue('');
    setPage(1);
  }, []);

  const renderStatus = (status: string) => {
    switch (status) {
      case 'unSuccess':
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

  const redirectToCreate = useCallback(() => {
    router.push('/split-the-bill/create');
  }, [router]);

  const redirectToDetail = useCallback(
    (id: string) => {
      router.push('/split-the-bill/' + id);
    },
    [router]
  );

  const people = useMemo(() => {
    return [
      {
        id: 1,
        name: 'Chi tiết',
        designation: 'Chi tiết hóa đơn',
        event: 'edit',
      },
      {
        id: 2,
        name: 'Xem nhanh',
        designation: 'Xem nhanh hóa đơn',
        event: 'preview',
      },
      {
        id: 3,
        name: 'Xóa',
        designation: 'Xóa hóa đơn',
        event: 'delete',
      },
    ];
  }, []);

  const renderCell = useCallback(
    (data: any, columnKey: React.Key) => {
      switch (columnKey) {
        case '$.0':
          return data.nameBill;
        case '$.1':
          return formatCurrency(
            Math.round(parseInt(sumTotalBill(data.listTransferPerson))) || 0
          );
        case '$.2':
          return renderStatus(data.status);
        case '$.3':
          return formatDate(data.createdAt);

        default:
          return (
            <div className='flex w-full flex-row items-center justify-center gap-1'>
              <AnimatedTooltip
                items={people}
                id={data._id}
                refetch={refetch}
                data={data}
              />
            </div>
          );
      }
    },
    [people, refetch]
  );

  const sumTotalBill = (listTransferPerson: any) => {
    const sumValues = listTransferPerson.reduce((acc: any, objectData: any) => {
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
  const pages = useMemo(() => {
    return totalBill ? Math.ceil(totalBill / 10) : 0;
  }, [totalBill]);

  return (
    <div className='isolate mx-auto flex min-h-full-screen flex-col'>
      {isLoading && (
        <Progress
          size='sm'
          isIndeterminate
          aria-label='Loading...'
          className='w-full'
        />
      )}

      <div
        className={cn(
          'flex w-full flex-col',
          'mx-auto max-w-screen-2xl px-5 pb-5 pt-3'
        )}
      >
        <div className='flex w-full flex-col '>
          <div className='flex min-h-full-content flex-col gap-6 lg:flex-row'>
            <div className='flex flex-1 flex-col gap-6 rounded-3xl bg-[#FEFEFE] p-4'>
              <Image src={'/images/banner.png'} alt='banner' height={300} />

              <div className='flex flex-col gap-4'>
                <div className='flex items-center justify-between'>
                  <div className='text-2xl'>Thông tin các hóa đơn</div>
                  <div onClick={redirectToCreate}>
                    <ShinyButton text='tạo hóa đơn' className='px-6 py-3' />
                  </div>
                </div>
                <div className='flex items-center gap-4'>
                  <Input
                    isClearable
                    aria-hidden={false}
                    className='w-full sm:max-w-[38%]'
                    placeholder='Tìm kiếm theo tên...'
                    startContent={<SearchIcon />}
                    variant='bordered'
                    value={filterValue}
                    onClear={() => onClear()}
                    onValueChange={onSearchChange}
                  />
                  <Dropdown>
                    <DropdownTrigger className='flex'>
                      <Button
                        endContent={<ChevronDownIcon className='text-small' />}
                        variant='flat'
                        color='primary'
                      >
                        Trạng thái
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      disallowEmptySelection
                      closeOnSelect={false}
                      selectedKeys={statusFilter}
                      selectionMode='multiple'
                      onSelectionChange={(e) => {
                        setStatusFilter(e);
                        setKey(Math.random());
                      }}
                      aria-label='Static Actions'
                    >
                      {statusOptions.map((status) => (
                        <DropdownItem
                          value={status.uid}
                          key={status.uid}
                          className='capitalize'
                        >
                          {status.name}
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                </div>
                {isLoading ? (
                  <div>
                    <Lottie
                      options={{
                        loop: true,
                        autoplay: true,
                        animationData: loadingEarthJson,
                        rendererSettings: {
                          preserveAspectRatio: 'xMidYMid slice',
                        },
                      }}
                      width={350}
                      isClickToPauseDisabled
                    />
                  </div>
                ) : (
                  <Table
                    isCompact
                    removeWrapper
                    classNames={{
                      th: 'bg-[#f4f4f4] uppercase text-[#191a1f] font-semibold',
                      tr: 'hover:bg-[#f4f4f4] h-[50px] rounded-3xl',
                      tbody: 'min-h-[300px]',
                    }}
                    bottomContent={
                      pages > 1 ? (
                        <div className='flex w-full justify-center'>
                          <Pagination
                            isCompact
                            showControls
                            showShadow
                            color='primary'
                            page={page}
                            total={pages}
                            onChange={(page) => setPage(page)}
                          />
                        </div>
                      ) : null
                    }
                  >
                    <TableHeader>
                      <TableColumn>Tên hóa đơn</TableColumn>
                      <TableColumn width={180}>Tổng số tiền</TableColumn>
                      <TableColumn width={120}>Trạng thái</TableColumn>
                      <TableColumn width={150}>Ngày Tạo</TableColumn>
                      <TableColumn width={120}>&nbsp;</TableColumn>
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
                            width={400}
                            height={300}
                          />
                        </div>
                      }
                      items={listData}
                    >
                      {(item: any) => (
                        <TableRow key={item._id}>
                          {(columnKey) => (
                            <TableCell>{renderCell(item, columnKey)}</TableCell>
                          )}
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>

            <div
              className={cn(
                'w-full rounded-3xl bg-[#FEFEFE] p-4 lg:w-1/3',
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
                      Bạn đã tạo <span className='text-3xl'>{totalBill}</span>{' '}
                      hóa đơn
                    </div>
                  </div>
                  <div className='text-xl'>
                    <div className='flex items-center gap-2 text-xl'>
                      <CheckBadge className='text-success-500' />
                      <div>
                        Đã có{' '}
                        <span className='text-3xl'>{totalBillSuccess}</span> hóa
                        đơn hoàn thành
                      </div>
                    </div>
                  </div>

                  <div className='text-xl'>
                    <div className='flex items-center gap-2 text-xl'>
                      <Clock className='text-primary' />
                      <div>
                        Còn{' '}
                        <span className='text-3xl'>{totalBillUnSuccess}</span>{' '}
                        hóa đơn chưa hoàn thành
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

              <div className='relative flex flex-1  flex-col gap-6 overflow-hidden rounded-3xl border px-4 py-6'>
                {listMentionBills?.length > 0 ? (
                  <Fragment>
                    <div className='text-center text-2xl'>
                      Hóa đơn chưa thanh toán
                    </div>
                    <table className='max-h-[500px]'>
                      <thead>
                        <tr className='h-10 bg-gray-100 text-left text-sm font-thin text-gray-500'>
                          <th className='pl-4'>Tên hóa đơn</th>
                          <th className=''>Số tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {listMentionBills.map((item: any) => (
                          <tr
                            key={item.id}
                            className='h-10 cursor-pointer border-b hover:bg-slate-200'
                            onClick={() => redirectToDetail(item.id)}
                          >
                            <td className='pl-4'>{item.nameBill}</td>
                            <td className='text-primary'>
                              {formatCurrency(
                                Math.round(item.moneyAfterReduction) || 0
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Fragment>
                ) : (
                  <Fragment>
                    <Lottie
                      options={{
                        loop: true,
                        autoplay: true,
                        animationData: listJson,
                        rendererSettings: {
                          preserveAspectRatio: 'xMidYMid slice',
                        },
                      }}
                      width={400}
                      isClickToPauseDisabled
                    />
                    <div className='text-center text-lg italic text-gray-500'>
                      Bạn không còn hóa đơn chưa thanh toán!
                    </div>
                  </Fragment>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
