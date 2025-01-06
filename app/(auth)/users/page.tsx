'use client';

import { Image, Input, Chip } from '@nextui-org/react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@nextui-org/react';
import { useCallback, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from '@/app/libs/axios';
import { SearchIcon } from 'lucide-react';
import { AnimatedTooltip } from '@/app/components/ui/animated-tooltip';
import { useRouter } from 'next/navigation';
import Lottie from 'react-lottie';
import NoData from '@/app/components/lotties/json/no-data.json';
import { cn } from '@/lib/utils';
import { Progress } from '@nextui-org/react';
import loadingEarthJson from '@/app/components/lotties/json/loading-earth.json';

const bankColorMap: Record<string, any> = {
  VIETCOMBANK: '#17c964',
  TECHCOMBANK: '#0070f0',
  MBBANK: '#9750dd',
  ACB: '#f5a524',
  TPBANK: '#f31260',
  BIDV: '#17c964',
  VPBANK: '#0070f0',
  VIB: '#9750dd',
  SACOMBANK: '#f5a524',
  MSB: '#f31260',
  VIETINBANK: '#17c964',
  AGRIBANK: '#0070f0',
  OCB: '#9750dd',
  HDBANK: '#f5a524',
  SHB: '#f31260',
  SCB: '#17c964',
  SEABANK: '#0070f0',
  BAB: '#9750dd',
  PVCB: '#f5a524',
  OCEANBANK: '#f31260',
  NCB: '#17c964',
};

export default function Users() {
  const [filterValue, setFilterValue] = useState('');
  const router = useRouter();

  const {
    data: users,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ['users', filterValue],
    queryFn: async () => {
      const response = await axios.get('/api/accounts', {
        params: {
          search: filterValue,
        },
      });
      return response.data;
    },
  });

  const onSearchChange = useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
    } else {
      setFilterValue('');
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue('');
  }, []);

  const people = useMemo(
    () => [
      {
        id: 1,
        name: 'Chỉnh sửa',
        designation: 'Chỉnh sửa thông tin',
        event: 'edit',
      },
      {
        id: 2,
        name: 'Xóa',
        designation: 'Xóa người dùng',
        event: 'delete',
      },
    ],
    []
  );

  const renderCell = useCallback(
    (user: any, columnKey: React.Key) => {
      const cellValue = user[columnKey as keyof typeof user];

      switch (columnKey) {
        case '$.0':
          return <div className='font-medium text-[#191a1f]'>{user.name}</div>;
        case '$.1':
          return (
            <div className='font-medium text-[#0070f0]'>
              {user.accountNumber}
            </div>
          );
        case '$.2':
          const bankCode = user.codeBank?.toUpperCase();
          return (
            <Chip
              className='capitalize'
              style={{
                backgroundColor: `${bankColorMap[bankCode]}20`,
                color: bankColorMap[bankCode] || '#889096',
              }}
              size='sm'
              variant='flat'
            >
              {user.codeBank}
            </Chip>
          );
        case '$.3':
          return (
            <div
              className={cn(
                'font-medium',
                user.idMattermost ? 'text-[#17c964]' : 'text-[#889096]'
              )}
            >
              {user.idMattermost || 'Chưa cập nhật'}
            </div>
          );
        default:
          return (
            <div className='flex justify-center'>
              <AnimatedTooltip
                items={people}
                id={user._id}
                refetch={refetch}
                data={user}
              />
            </div>
          );
      }
    },
    [people, refetch]
  );

  return (
    <div className='isolate mx-auto flex min-h-full-screen flex-col'>
      <div
        className={cn(
          'flex w-full flex-col',
          'mx-auto max-w-screen-2xl px-5 pb-5 pt-3'
        )}
      >
        <div className='flex w-full flex-col'>
          <div className='flex min-h-full-content flex-col gap-6'>
            <div className='flex flex-1 flex-col gap-6 rounded-3xl bg-[#FEFEFE] p-4'>
              <Image src={'/images/banner.png'} alt='banner' height={300} />

              <div className='flex flex-col gap-4'>
                <div className='flex items-center justify-between'>
                  <div className='text-2xl'>Quản lý tài khoản</div>
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
                  >
                    <TableHeader>
                      <TableColumn>Tên</TableColumn>
                      <TableColumn width={180}>Số tài khoản</TableColumn>
                      <TableColumn width={150}>Mã ngân hàng</TableColumn>
                      <TableColumn width={150}>ID Mattermost</TableColumn>
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
                      items={users?.accounts || []}
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

            {isLoading && (
              <Progress
                size='sm'
                isIndeterminate
                aria-label='Loading...'
                className='w-full'
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
