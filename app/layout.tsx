import type { Metadata } from 'next';
import './globals.css';
import NextUIProviderClient from './providers/NextUIProviderClient';

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NextUIProviderClient>{children}</NextUIProviderClient>;
}
