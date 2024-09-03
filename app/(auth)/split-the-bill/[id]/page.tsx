'use client';

import SplitTheBill from '@/app/components/SplitTheBill';
import axios from '@/app/libs/axios';
import { useMutation } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export default function DetailBill() {
  const breadcrumbs = [
    {
      name: 'Dashboard',
      href: '/split-the-bill',
    },
    {
      name: 'Chi tiết hóa đơn',
      href: '',
    },
  ];

  const [data, setData] = useState({} as any);

  const { id } = useParams();

  const router = useRouter();

  const { mutate: getDetailData } = useMutation({
    mutationFn: async () => {
      const response = await axios.get(`/api/bill/${id}`);
      return response.data.bill;
    },
    onSuccess: (res) => {
      if (!data) {
        router.push('/split-the-bill');
      } else {
        setData(res);
      }
    },
    onError: () => {
      toast.error('Có lỗi xảy ra');
    },
  });

  useEffect(() => {
    if (id) {
      getDetailData();
    }
  }, [getDetailData, id]);

  return (
    <div className='isolate mx-auto flex min-h-full-screen flex-col'>
      <SplitTheBill
        breadcrumbs={breadcrumbs}
        isCreate={false}
        dataBill={data}
      />
    </div>
  );
}
