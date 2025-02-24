'use client';

import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Pagination,
  Progress,
  Image,
  Modal,
  ModalContent,
  Button,
} from '@nextui-org/react';
import { useCallback, useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import axios from '@/app/libs/axios';
import { useRouter } from 'next/navigation';
import NoData from '@/app/components/lotties/json/no-data.json';
import Lottie from 'react-lottie';
import loadingEarthJson from '@/app/components/lotties/json/loading-earth.json';
import { getInfoBill } from '@/lib/utils';
import QR from '@/app/assets/svg/QR';
import { useSession } from 'next-auth/react';

export default function UnpaidBills() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [totalBills, setTotalBills] = useState(0);
  const [listData, setListData] = useState([]);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedQRImage, setSelectedQRImage] = useState('');
  const { data: session } = useSession();

  const getMention = useCallback(() => {
    const email = session?.user?.email;
    if (!email) return '';
    const atIndex = email.indexOf('@');
    return atIndex !== -1 ? email.substring(0, atIndex) : email;
  }, [session]);

  const { isLoading } = useQuery({
    queryKey: [`get-unpaid-bills`, page],
    queryFn: async () => {
      const result = await axios('/api/bill/unpaid?page=' + page);
      const data = result.data;
      setTotalBills(data.total || 0);
      setListData(data.bills || []);
      return data.bills;
    },
    placeholderData: keepPreviousData,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const redirectToDetail = useCallback(
    (id: string) => {
      router.push('/split-the-bill/' + id);
    },
    [router]
  );

  const pages = useMemo(() => {
    return totalBills ? Math.ceil(totalBills / 10) : 0;
  }, [totalBills]);

  const renderCell = useCallback(
    (data: any, columnKey: React.Key) => {
      switch (columnKey) {
        case 'nameBill':
          return data.nameBill;
        case 'amount':
          return (
            <div className='text-primary'>
              {formatCurrency(Math.round(data.moneyAfterReduction) || 0)}
            </div>
          );
        case 'qr':
          return (
            <div className='flex items-center justify-center'>
              <Button
                color='primary'
                variant='flat'
                onPress={() => {
                  setSelectedQRImage(
                    `https://img.vietqr.io/image/${data.bank}-${
                      data.accountNumber
                    }-print.png?amount=${
                      data.moneyAfterReduction
                    }&accountName=${data.name}&addInfo=${getInfoBill(
                      data.nameBill ?? '',
                      data.uid ?? '',
                      getMention() ?? ''
                    )}`
                  );
                  setIsQRModalOpen(true);
                }}
                className='capitalize'
              >
                hiển thị QR
                <QR className='w-fit text-default-400' />
              </Button>
            </div>
          );
        default:
          return null;
      }
    },
    [getMention]
  );

  return (
    <div className='mx-auto max-w-screen-xl px-4 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold'>Hóa Đơn Chưa Thanh Toán</h1>
        <p className='mt-2 text-gray-600'>
          Danh sách các hóa đơn bạn cần thanh toán
        </p>
      </div>

      {isLoading ? (
        <div className='flex justify-center'>
          <Progress
            size='sm'
            isIndeterminate
            aria-label='Loading...'
            className='w-full'
          />
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
          aria-label='Danh sách hóa đơn chưa thanh toán'
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
          classNames={{
            th: 'bg-[#f4f4f4] text-[#191a1f] font-semibold',
            tr: 'hover:bg-[#f4f4f4] cursor-pointer',
          }}
        >
          <TableHeader className=''>
            <TableColumn key='nameBill' className='font-bold uppercase'>
              Tên hóa đơn
            </TableColumn>
            <TableColumn key='amount' className='font-bold uppercase'>
              Số tiền
            </TableColumn>
            <TableColumn
              key='qr'
              width={150}
              className='text-center font-bold uppercase'
            >
              QR
            </TableColumn>
          </TableHeader>
          <TableBody
            items={listData}
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
          >
            {(item: any) => (
              <TableRow key={item.id} className='border-b'>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <Modal
        isOpen={isQRModalOpen}
        onOpenChange={() => setIsQRModalOpen(false)}
        size='full'
        classNames={{
          backdrop: 'bg-black/70',
          base: 'flex items-center justify-center',
          closeButton: 'z-50',
        }}
      >
        <ModalContent>
          <div className='relative flex h-screen w-screen items-center justify-center'>
            <Image
              alt='QR Code Full Size'
              className='max-h-[90vh] max-w-[90%] object-contain'
              src={selectedQRImage}
            />
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}
