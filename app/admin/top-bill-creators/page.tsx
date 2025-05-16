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

interface TopCreator {
  email: string;
  name: string;
  totalCreated: number;
}

export default function TopBillCreatorsList() {
  const [creators, setCreators] = useState<TopCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const rowsPerPage = 10;

  useEffect(() => {
    fetchTopCreators();
  }, [page]);

  const fetchTopCreators = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/admin/top-bill-creators?page=${page}&limit=${rowsPerPage}`
      );
      setCreators(response.data.creators);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching top bill creators:', error);
    } finally {
      setLoading(false);
    }
  };

  const pages = Math.ceil(total / rowsPerPage);

  return (
    <div className='space-y-6 p-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Top người tạo hóa đơn</h1>
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
            aria-label='Danh sách người tạo hóa đơn nhiều nhất'
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
              <TableColumn>Email</TableColumn>
              <TableColumn>Số hóa đơn đã tạo</TableColumn>
              <TableColumn>Thao tác</TableColumn>
            </TableHeader>
            <TableBody
              loadingContent={<div>Đang tải...</div>}
              loadingState={loading ? 'loading' : 'idle'}
              emptyContent={'Không có dữ liệu'}
            >
              {creators.map((creator, index) => (
                <TableRow key={creator.email}>
                  <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                  <TableCell>{creator.name}</TableCell>
                  <TableCell>{creator.email}</TableCell>
                  <TableCell>
                    <span className='font-semibold text-blue-500'>
                      {creator.totalCreated}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/creator-bills/${encodeURIComponent(
                        creator.email
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
