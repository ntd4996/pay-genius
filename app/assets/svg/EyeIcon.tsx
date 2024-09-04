import { cn } from '@/lib/utils';
import React from 'react';

export default function EyeIcon({ className }: { className?: string }) {
  return (
    // <svg
    //   xmlns='http://www.w3.org/2000/svg'
    //   fill='none'
    //   viewBox='0 0 24 24'
    //   strokeWidth={1.5}
    //   stroke='currentColor'
    //   className={cn('h-5 w-5', className)}
    // >
    //   <path
    //     strokeLinecap='round'
    //     strokeLinejoin='round'
    //     d='M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z'
    //   />
    //   <path
    //     strokeLinecap='round'
    //     strokeLinejoin='round'
    //     d='M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'
    //   />
    // </svg>
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 512 512'
      stroke='currentColor'
      className={cn('h-5 w-5 fill-black', className)}
    >
      <path d='M256 128c-81.9 0-145.7 48.8-224 128 67.4 67.7 124 128 224 128 99.9 0 173.4-76.4 224-126.6C428.2 198.6 354.8 128 256 128zm0 219.3c-49.4 0-89.6-41-89.6-91.3 0-50.4 40.2-91.3 89.6-91.3s89.6 41 89.6 91.3c0 50.4-40.2 91.3-89.6 91.3z'></path>
      <path d='M256 224c0-7.9 2.9-15.1 7.6-20.7-2.5-.4-5-.6-7.6-.6-28.8 0-52.3 23.9-52.3 53.3s23.5 53.3 52.3 53.3 52.3-23.9 52.3-53.3c0-2.3-.2-4.6-.4-6.9-5.5 4.3-12.3 6.9-19.8 6.9-17.8 0-32.1-14.3-32.1-32z'></path>
    </svg>
  );
}
