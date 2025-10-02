'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import useHomeNavigation from '@/hooks/useHomeNavigation';
import { ADMIN_ACCOUNT_ITEMS, ADMIN_MENU_ITEMS } from '@/lib/constants';
import Image from 'next/image';
import Link from 'next/link';

const AdminSidebar = () => {
  const { handleHomeClick } = useHomeNavigation();
  return (
    <Sidebar>
      <SidebarHeader className='p-4'>
        <Link
          href='/'
          className='flex items-center gap-2'
          onClick={handleHomeClick}
        >
          <Image
            src={`/assets/muted-logo-blue.png`}
            alt='Logo'
            width={40}
            height={40}
          />
          <span className='text-lg font-semibold text-white/90'>Muted</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className='text-xs font-medium text-white/40 uppercase tracking-wider mb-2'>
            MENU
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ADMIN_MENU_ITEMS.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.isActive}
                    className='text-white/60 hover:text-white/90 hover:bg-white/5 data-[active=true]:bg-white/5 data-[active=true]:text-white/90'
                  >
                    <Link href={item.url} className='flex items-center gap-3'>
                      <item.icon className='size-4' />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className='mt-4'>
          <SidebarGroupLabel className='text-xs font-medium text-white/40 uppercase tracking-wider mb-2'>
            ACCOUNT
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ADMIN_ACCOUNT_ITEMS.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className='text-white/60 hover:text-white/90 hover:bg-white/5'
                  >
                    <Link href={item.url} className='flex items-center gap-3'>
                      <item.icon className='size-4' />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
