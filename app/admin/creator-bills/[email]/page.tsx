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

interface CreatorBill {
  id: string;
  nameBill: string;
  bank: string;
  accountNumber: string;
  name: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  participants: number;
}

export default function CreatorBillsList() {
  const params = useParams();
  const email = decodeURIComponent(params.email as string);

  const [bills, setBills] = useState<CreatorBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const rowsPerPage = 10;

  useEffect(() => {
    fetchCreatorBills();
  }, [page, email]);

  const fetchCreatorBills = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/admin/creator-bills/${encodeURIComponent(
          email
        )}?page=${page}&limit=${rowsPerPage}`
      );
      setBills(response.data.bills);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching creator bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const pages = Math.ceil(total / rowsPerPage);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className='space-y-6 p-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Hóa đơn đã tạo bởi: {email}</h1>
        <Link
          href='/admin/top-bill-creators'
          className='rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300'
        >
          Quay lại
        </Link>
      </div>

      <Card>
        <CardBody>
          <Table
            aria-label='Danh sách hóa đơn đã tạo'
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
              <TableColumn>Chủ TK</TableColumn>
              <TableColumn>Tổng tiền</TableColumn>
              <TableColumn>Số người</TableColumn>
              <TableColumn>Trạng thái</TableColumn>
              <TableColumn>Ngày tạo</TableColumn>
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
                    <span className='font-semibold'>
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(bill.totalAmount)}
                    </span>
                  </TableCell>
                  <TableCell>{bill.participants}</TableCell>
                  <TableCell>
                    <span
                      className={
                        bill.status === 'unSuccess'
                          ? 'text-red-500'
                          : 'text-green-500'
                      }
                    >
                      {bill.status === 'unSuccess'
                        ? 'Chưa hoàn thành'
                        : 'Đã hoàn thành'}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(bill.createdAt)}</TableCell>
                  <TableCell>
                    <Link
                      href={`/split-the-bill/${bill.id}`}
                      className='rounded-md bg-blue-500 px-3 py-1 text-white hover:bg-blue-600'
                    >
                      Xem chi tiết
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
