'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardBody } from '@nextui-org/react';
import ReactECharts from 'echarts-for-react';

interface DashboardStats {
  totalBills: number;
  totalPaidBills: number;
  totalUnpaidBills: number;
  topUsersByBills: Array<{
    mention: string;
    name: string;
    totalBills: number;
  }>;
  topUsersByUnpaidBills: Array<{
    mention: string;
    name: string;
    totalUnpaidBills: number;
  }>;
  topBillCreators: Array<{
    email: string;
    name: string;
    totalCreated: number;
  }>;
  billStatusData: {
    paid: number;
    unpaid: number;
  };
  monthlyBillsData: Array<{
    month: string;
    total: number;
    paid: number;
    unpaid: number;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const billStatusOption = {
    title: {
      text: 'Trạng thái hóa đơn',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        type: 'pie',
        radius: '50%',
        data: stats
          ? [
              {
                value: stats.billStatusData.paid,
                name: 'Đã thanh toán',
                itemStyle: { color: '#4ade80' },
              },
              {
                value: stats.billStatusData.unpaid,
                name: 'Chưa thanh toán',
                itemStyle: { color: '#f87171' },
              },
            ]
          : [],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  const monthlyBillsOption = {
    title: {
      text: 'Thống kê hóa đơn theo tháng',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['Tổng', 'Đã thanh toán', 'Chưa thanh toán'],
      top: 'bottom',
    },
    xAxis: {
      type: 'category',
      data: stats?.monthlyBillsData.map((item) => item.month) || [],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: 'Tổng',
        type: 'line',
        data: stats?.monthlyBillsData.map((item) => item.total) || [],
      },
      {
        name: 'Đã thanh toán',
        type: 'line',
        data: stats?.monthlyBillsData.map((item) => item.paid) || [],
      },
      {
        name: 'Chưa thanh toán',
        type: 'line',
        data: stats?.monthlyBillsData.map((item) => item.unpaid) || [],
      },
    ],
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <Card>
          <CardBody>
            <div className='text-center'>
              <p className='text-sm text-gray-500'>Tổng số hóa đơn</p>
              <p className='text-2xl font-bold'>{stats?.totalBills || 0}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className='text-center'>
              <p className='text-sm text-gray-500'>Đã thanh toán</p>
              <p className='text-2xl font-bold text-green-500'>
                {stats?.totalPaidBills || 0}
              </p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className='text-center'>
              <p className='text-sm text-gray-500'>Chưa thanh toán</p>
              <p className='text-2xl font-bold text-red-500'>
                {stats?.totalUnpaidBills || 0}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <Card>
          <CardBody>
            <ReactECharts
              option={billStatusOption}
              style={{ height: '400px' }}
            />
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <ReactECharts
              option={monthlyBillsOption}
              style={{ height: '400px' }}
            />
          </CardBody>
        </Card>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <Card>
          <CardBody>
            <h3 className='mb-4 text-lg font-semibold'>
              Top người dùng có nhiều hóa đơn nhất
            </h3>
            <div className='space-y-2'>
              {stats?.topUsersByBills.map((user, index) => (
                <div
                  key={user.mention}
                  className='flex items-center justify-between'
                >
                  <span>
                    {index + 1}. {user.name} ({user.mention})
                  </span>
                  <span className='font-semibold'>
                    {user.totalBills} hóa đơn
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h3 className='mb-4 text-lg font-semibold'>
              Top người dùng có nhiều hóa đơn chưa thanh toán
            </h3>
            <div className='space-y-2'>
              {stats?.topUsersByUnpaidBills.map((user, index) => (
                <div
                  key={user.mention}
                  className='flex items-center justify-between'
                >
                  <span>
                    {index + 1}. {user.mention}
                  </span>
                  <span className='font-semibold text-red-500'>
                    {user.totalUnpaidBills} hóa đơn
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h3 className='mb-4 text-lg font-semibold'>
              Top người tạo hóa đơn
            </h3>
            <div className='space-y-2'>
              {stats?.topBillCreators.map((user, index) => (
                <div
                  key={user.email}
                  className='flex items-center justify-between'
                >
                  <span>
                    {index + 1}. {user.name}
                  </span>
                  <span className='font-semibold text-blue-500'>
                    {user.totalCreated} hóa đơn
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
