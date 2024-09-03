'use client';

import React, { useEffect } from 'react';
import { Button } from '@nextui-org/react';
import { signIn, useSession } from 'next-auth/react';
import { Boxes } from './components/ui/background-boxes';
import { BackgroundGradient } from './components/ui/background-gradient';
import LogoGoogle from './assets/svg/LogoGoogle';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Login() {
  const { data: session } = useSession();

  const router = useRouter();

  if (session && session.user) {
    router.push('/split-the-bill');
  }
  const searchParams = useSearchParams();
  const currentUrl = searchParams.get('currentUrl');

  const login = () => {
    signIn('google', {
      callbackUrl: currentUrl ? currentUrl : '/split-the-bill',
    });
  };

  return (
    <div className='relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-slate-900 px-4 sm:px-0 '>
      <div className='pointer-events-none absolute inset-0 z-20 h-full w-full bg-slate-900 [mask-image:radial-gradient(transparent,white)]' />

      <Boxes />
      <BackgroundGradient className='w-full rounded-[22px] bg-slate-900 dark:bg-zinc-900 sm:p-10'>
        <p className='mb-8 text-center text-xl text-white dark:text-neutral-200 sm:text-2xl'>
          Continue <span className='font-astroSpace text-4xl'>Qr-PayShare</span>{' '}
          with
        </p>

        <Button
          className='group/btn relative z-20 flex h-[55px] w-full items-center justify-start space-x-2 rounded-md p-4 font-medium text-black shadow-input hover:bg-white'
          onClick={() => login()}
        >
          <LogoGoogle />
          <span className='text-sm text-neutral-700'>Sign in with Google</span>
        </Button>
      </BackgroundGradient>
    </div>
  );
}
