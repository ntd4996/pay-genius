'use client';

import { cn } from '@nextui-org/react';
import TabsComponent from './components/Tabs';

export default function Home() {
  return (
    <div className='isolate mx-auto flex min-h-screen flex-col'>
      <div
        className={cn(
          'sticky inset-x-0 top-0 z-50 border-b border-gray-100 bg-white/90 py-3 backdrop-blur-lg',
          'text-2xl capitalize '
        )}
      >
        <div className='mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between'>QR PayShare</div>
        </div>
      </div>
      <div
        className={cn('flex w-full flex-col', 'mx-auto max-w-screen-xl p-5')}
      >
        <div className='flex flex-col gap-3'>
          <div
            className={cn(
              'font-display text-center text-3xl font-semibold tracking-tight text-gray-900 sm:text-left sm:text-3xl lg:text-4xl',
              'mt-4'
            )}
          >
            Hiện trạng <span className='text-primary'>QR PayShare</span>
          </div>
          <div className='mt-2 font-semibold'>
            Không thể quét được mã VietQR trên App Techcombank.
          </div>
          <div className='leading-8'>
            App Techcombank Mobile mới đã hỗ trợ quét mã VietQR
            <br /> Tuy nhiên app cũ, Techcombank F@st i-bank hiện đang trong quá
            trình chờ đóng cửa khi người dùng chuyển qua app mới, nên sẽ không
            hỗ trợ QR
          </div>
          <div className='mt-2 font-semibold'>
            Quét bằng App MBBank không điền nội dung
          </div>
          <div className='leading-8'>
            Khi quét từ nút bấm scan QR ở màn hình chính (trước khi đăng nhập)
            thì MBBank có điền nội dung. Tuy nhiên, khi bấm nút Scan ở màn hình
            chuyển tiền thì MBBank chỉ điền STK và ngân hàng, không điền nội
            dung và số tiền
          </div>
        </div>

        <hr className='my-8' />
        <TabsComponent />
      </div>
    </div>
  );
}
