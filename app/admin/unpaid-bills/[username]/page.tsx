/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Card,
  CardBody,
} from '@nextui-org/react';
import axios from 'axios';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface UnpaidBill {
  id: string;
  nameBill: string;
  bank: string;
  accountNumber: string;
  name: string;
  uid: string;
  moneyAfterReduction: number;
  mention: string;
}

export default function UserUnpaidBills() {
  const params = useParams();
  const username = params.username as string;

  const [bills, setBills] = useState<UnpaidBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const rowsPerPage = 10;

  useEffect(() => {
    fetchUserUnpaidBills();
  }, [page, username]);

  const fetchUserUnpaidBills = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/admin/unpaid-bills/${username}?page=${page}&limit=${rowsPerPage}`
      );
      setBills(response.data.bills);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching user unpaid bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const pages = Math.ceil(total / rowsPerPage);

  return (
    <div className='space-y-6 p-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>
          Hóa đơn chưa thanh toán của @{username}
        </h1>
        <Link
          href='/admin/unpaid-bills'
          className='rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300'
        >
          Quay lại
        </Link>
      </div>

      <Card>
        <CardBody>
          <Table
            aria-label='Danh sách hóa đơn chưa thanh toán'
            bottomContent={
              pages > 0 ? (
                <div className='flex justify-center'>
                  <Pagination
                    total={pages}
                    color='primary'
                    page={page}
                    onChange={setPage}
                  />
                </div>
              ) : null
            }
          >
            <TableHeader>
              <TableColumn>STT</TableColumn>
              <TableColumn>Tên hóa đơn</TableColumn>
              <TableColumn>Ngân hàng</TableColumn>
              <TableColumn>Số tài khoản</TableColumn>
              <TableColumn>Tên chủ TK</TableColumn>
              <TableColumn>Số tiền</TableColumn>
              <TableColumn>Đề cập</TableColumn>
              <TableColumn>Thao tác</TableColumn>
            </TableHeader>
            <TableBody
              loadingContent={<div>Đang tải...</div>}
              loadingState={loading ? 'loading' : 'idle'}
              emptyContent={'Không có dữ liệu'}
            >
              {bills.map((bill, index) => (
                <TableRow key={bill.id}>
                  <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                  <TableCell>{bill.nameBill}</TableCell>
                  <TableCell>{bill.bank}</TableCell>
                  <TableCell>{bill.accountNumber}</TableCell>
                  <TableCell>{bill.name}</TableCell>
                  <TableCell>
                    <span className='font-semibold text-red-500'>
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(bill.moneyAfterReduction)}
                    </span>
                  </TableCell>
                  <TableCell>{bill.mention}</TableCell>
                  <TableCell>
                    <Link
                      href={`/split-the-bill/${bill.id}`}
                      className='rounded-md bg-blue-500 px-3 py-1 text-white hover:bg-blue-600'
                    >
                      Xem hóa đơn
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
