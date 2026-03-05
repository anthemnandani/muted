'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Page } from '@/lib/types';

const LegalSidebar = ({ pages }: { pages: Page[] }) => {
  const pathname = usePathname();

  return (
    <aside className='w-full md:w-64 shrink-0 fixed top-0 border-r border-white/10 min-h-screen p-6 '>
      <div className='flex flex-col gap-8'>
        <Link
          href='/'
          className='flex items-center gap-3 transition-opacity hover:opacity-80'
        >
          <Image
            src='/assets/muted-logo-blue.png'
            alt='Muted Logo'
            width={32}
            height={32}
          />
          <span className='text-xl font-bold text-white'>Muted</span>
        </Link>

        <nav className='flex flex-col gap-1'>
          <h3 className='text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 px-3'>
            Legal & Info
          </h3>
          {pages.map((page) => {
            const isActive = pathname.includes(page.slug);

            return (
              <Link
                key={page.slug}
                href={`/pages/${page.slug}`}
                className={cn(
                  'px-3 py-2 rounded-md text-sm transition-all duration-200',
                  isActive
                    ? 'bg-primary-blue/10 text-primary-blue font-medium'
                    : 'text-white/60 hover:text-white/90 hover:bg-white/5',
                )}
              >
                {page.title}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default LegalSidebar;
