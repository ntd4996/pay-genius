import type { Metadata } from 'next';
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import NextUIProviderClient from './providers/NextUIProviderClient';
import QueryProviders from './providers/QueryProviders';
import AuthSessionProvider from './providers/AuthSessionProvider';

export const metadata: Metadata = {
  title: 'QR PayShare - Chia sẻ và Thanh toán qua Mã QR',
  description:
    'Tạo và chia sẻ hóa đơn, thanh toán dễ dàng thông qua mã QR với QR PayShare.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProviders>
      <AuthSessionProvider>
        <NextUIProviderClient>{children}</NextUIProviderClient>
      </AuthSessionProvider>
    </QueryProviders>
  );
}
