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

interface UnpaidUser {
  mention: string;
  name: string;
  totalUnpaidBills: number;
}

export default function UnpaidBillsList() {
  const [users, setUsers] = useState<UnpaidUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const rowsPerPage = 10;

  useEffect(() => {
    fetchUnpaidUsers();
  }, [page]);

  const fetchUnpaidUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/admin/unpaid-users?page=${page}&limit=${rowsPerPage}`
      );
      setUsers(response.data.users);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching unpaid users:', error);
    } finally {
      setLoading(false);
    }
  };

  const pages = Math.ceil(total / rowsPerPage);

  return (
    <div className='space-y-6 p-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>
          Người dùng có hóa đơn chưa thanh toán
        </h1>
        <Link
          href='/admin'
          className='rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300'
        >
          Quay lại
        </Link>
      </div>

      <Card>
        <CardBody>
          <Table
            aria-label='Danh sách người dùng có hóa đơn chưa thanh toán'
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
              <TableColumn>Tên người dùng</TableColumn>
              <TableColumn>Đề cập</TableColumn>
              <TableColumn>Số hóa đơn chưa TT</TableColumn>
              <TableColumn>Thao tác</TableColumn>
            </TableHeader>
            <TableBody
              loadingContent={<div>Đang tải...</div>}
              loadingState={loading ? 'loading' : 'idle'}
              emptyContent={'Không có dữ liệu'}
            >
              {users.map((user, index) => (
                <TableRow key={user.mention}>
                  <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.mention}</TableCell>
                  <TableCell>
                    <span className='font-semibold text-red-500'>
                      {user.totalUnpaidBills}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/unpaid-bills/${encodeURIComponent(
                        (user.mention || '@')
                          .replace('@', '')
                          .split(/[\s:]+/)[0]
                      )}`}
                      className='rounded-md bg-blue-500 px-3 py-1 text-white hover:bg-blue-600'
                    >
                      Chi tiết
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
