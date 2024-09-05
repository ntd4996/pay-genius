'use client';
import { useSession } from 'next-auth/react';
import Header from '../components/Header';
import Lottie from 'react-lottie';
import LoadingJson from '../components/lotties/json/loading.json';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  if (status === 'loading')
    return (
      <div className='flex h-screen w-screen items-center justify-center'>
        <Lottie
          options={{
            loop: true,
            autoplay: true,
            animationData: LoadingJson,
            rendererSettings: {
              preserveAspectRatio: 'xMidYMid slice',
            },
          }}
          width={200}
          height={200}
        />
      </div>
    );

  return (
    <div className='bg-[#F4f4f4]'>
      <Header />
      {children}
    </div>
  );
}
