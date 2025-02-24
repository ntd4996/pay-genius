'use client';

import React from 'react';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Link,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  User,
  cn,
} from '@nextui-org/react';
import { signOut, useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import Cut from '../assets/svg/Cut';
import QR from '../assets/svg/QR';
import { ClockIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const menuItems = ['Profile', 'Dashboard', 'Activity'];

  const { data: session } = useSession();

  const path = usePathname();

  const router = useRouter();

  const redirectToHome = () => {
    router.push('/split-the-bill');
  };

  return (
    <Navbar
      onMenuOpenChange={setIsMenuOpen}
      maxWidth='2xl'
      className='bg-[#f4f4f4]'
      position='static'
      height={'70px'}
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className='sm:hidden'
        />
        <NavbarBrand className=''>
          <div
            onClick={redirectToHome}
            className='flex cursor-pointer flex-col items-center justify-center rounded-full bg-[#FEFEFE] px-6 py-2 font-astroSpace text-2xl text-slate-500'
          >
            QR PayShare
          </div>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className='hidden gap-4 sm:flex' justify='center'>
        <div className='flex justify-center gap-6 rounded-full bg-[#fefefe] px-6 py-3'>
          <NavbarItem isActive={path.includes('/split-the-bill')}>
            <Link
              href='/split-the-bill'
              className={cn(
                path.includes('/split-the-bill')
                  ? 'text-primary'
                  : 'text-[#191a1f]',
                'flex gap-2'
              )}
            >
              <Cut />
              Chia Tiền
            </Link>
          </NavbarItem>
          <NavbarItem isActive={path.includes('/create-qr')}>
            <Link
              href='/create-qr'
              className={cn(
                path.includes('/create-qr') ? 'text-primary' : 'text-[#191a1f]',
                'flex gap-2'
              )}
            >
              <QR />
              Tạo mã QR
            </Link>
          </NavbarItem>
          <NavbarItem isActive={path.includes('/unpaid')}>
            <Link
              href='/unpaid'
              className={cn(
                path.includes('/unpaid') ? 'text-primary' : 'text-[#191a1f]',
                'flex gap-2'
              )}
            >
              <ClockIcon className='h-5 w-5' />
              Chưa thanh toán
            </Link>
          </NavbarItem>
        </div>
      </NavbarContent>
      <NavbarContent justify='end'>
        <NavbarItem>
          {session && session.user && (
            <div className='flex w-fit items-center justify-center gap-0 rounded-full sm:bg-[#FEFEFE] sm:px-3 sm:py-2'>
              <Dropdown placement='bottom-start'>
                <DropdownTrigger>
                  <User
                    as='button'
                    avatarProps={{
                      isBordered: true,
                      src: session.user.image ?? '',
                      size: 'sm',
                    }}
                    className='w-full transition-transform'
                    description={session.user.email}
                    name={session.user.name}
                    classNames={{
                      name: 'hidden sm:block',
                      description: 'hidden sm:block',
                    }}
                  />
                </DropdownTrigger>
                <DropdownMenu aria-label='User Actions' variant='flat'>
                  <DropdownItem
                    key='logout'
                    color='danger'
                    onClick={() => signOut()}
                  >
                    Log Out
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          )}
        </NavbarItem>
      </NavbarContent>
      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              color={
                index === 2
                  ? 'primary'
                  : index === menuItems.length - 1
                  ? 'danger'
                  : 'foreground'
              }
              className='w-full'
              href='#'
              size='lg'
            >
              {item}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
}
