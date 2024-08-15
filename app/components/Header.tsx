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
} from '@nextui-org/react';
import { signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const menuItems = ['Profile', 'Dashboard', 'Activity'];

  const { data: session } = useSession();

  const path = usePathname();

  return (
    <Navbar onMenuOpenChange={setIsMenuOpen} isBordered maxWidth='xl'>
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className='sm:hidden'
        />
        <NavbarBrand>
          <div className='flex items-center justify-between font-astroSpace text-2xl text-slate-500'>
            QR PayShare
          </div>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className='hidden gap-4 sm:flex' justify='center'>
        <NavbarItem isActive={path === '/split-the-bill'}>
          <Link href='/split-the-bill' color='foreground'>
            Chia Tiền
          </Link>
        </NavbarItem>
        <NavbarItem isActive={path === '/create-qr'}>
          <Link href='/create-qr' color='foreground'>
            Tạo mã QR
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify='end'>
        <NavbarItem>
          {session && session.user && (
            <div className='w-fit'>
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
