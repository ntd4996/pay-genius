'use client';

import { Inter } from 'next/font/google';
import { NextUIProvider } from '@nextui-org/react';

const inter = Inter({ subsets: ['latin'] });

export default function NextUIProviderClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={inter.className} suppressHydrationWarning={true}>
        <NextUIProvider>{children}</NextUIProvider>
      </body>
    </html>
  );
}
