import type { Metadata } from 'next';
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import NextUIProviderClient from './providers/NextUIProviderClient';
import QueryProviders from './providers/QueryProviders';
import AuthSessionProvider from './providers/AuthSessionProvider';
import { Nunito } from 'next/font/google';
import { cn } from '@nextui-org/react';

export const metadata: Metadata = {
  title: 'QR PayShare - Chia sẻ và Thanh toán qua Mã QR',
  description:
    'Tạo và chia sẻ hóa đơn, thanh toán dễ dàng thông qua mã QR với QR PayShare.',
};

const nunito = Nunito({
  subsets: ['vietnamese'],
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProviders>
      <AuthSessionProvider>
        <NextUIProviderClient>
          <div className={cn(nunito.className, 'text-[#191a1f]')}>
            {children}
          </div>
        </NextUIProviderClient>
      </AuthSessionProvider>
    </QueryProviders>
  );
}
