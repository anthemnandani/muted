'use client';

import useBreakpoint from '@/hooks/useBreakpoint';
import useHomeNavigation from '@/hooks/useHomeNavigation';
import { useSearchStore } from '@/store/searchStore';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '../icons';
import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import NewPost from '../modals/NewPost';
import { PlusSquare } from 'lucide-react';

const BottomBar = () => {
    const { user } = useUser();
    const { isMobile } = useBreakpoint();
    const pathname = usePathname();
    const { handleHomeClick } = useHomeNavigation();

    const { isSearchOpen, setIsSearchOpen } = useSearchStore();

    useEffect(() => {
        if (isSearchOpen) {
            setIsSearchOpen(false);
        }
    }, [pathname]);

    if (!isMobile) return null;

    return (
        // <nav className='fixed bottom-0 left-0 right-0 z-[100] bg-[#101010] border-t border-border-light pb-safe'>
         <nav className='dark:bg-[#101010D9] bg-background fixed bottom-[-1px] left-0 right-0 z-20 w-full backdrop-blur-lg md:hidden px-4 pt-2 pb-[calc(0.5rem_+_env(safe-area-inset-bottom))]'>
            <div className='flex items-center justify-around w-full h-[56px]'>

                {/* HOME */}
                <Link
                    href="/"
                    onClick={handleHomeClick}
                    className={cn(
                        'flex items-center justify-center min-w-[44px] min-h-[44px]',
                        pathname === '/' ? 'text-white' : 'text-white/40'
                    )}
                >
                    <Icons.home className="size-6" />
                </Link>

                {/* VIDEOS */}
                <Link
                    href="/videos"
                    className={cn(
                        'flex items-center justify-center min-w-[44px] min-h-[44px]',
                        pathname?.startsWith('/videos') ? 'text-white' : 'text-white/40'
                    )}
                >
                    <Icons.videos className="size-6" />
                </Link>

                {/* ✅ CREATE (Modal instead of route) */}
                <NewPost
                    trigger={
                        <div className='flex items-center justify-center min-w-[44px] min-h-[44px] text-white/40'>
                            <PlusSquare className='size-7' />
                        </div>
                    }
                />

                {/* 🔍 SEARCH (Profile se pehle) */}
                <button
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className={cn(
                        'flex items-center justify-center min-w-[44px] min-h-[44px]',
                        isSearchOpen ? 'text-white' : 'text-white/40'
                    )}
                >
                    <Icons.search className="size-6" />
                </button>

                {/* PROFILE */}
                <Link
                    href={`/@${user?.username}`}
                    className={cn(
                        'flex items-center justify-center min-w-[44px] min-h-[44px]',
                        pathname?.match(/^\/@\w+$/) ? 'text-white' : 'text-white/40'
                    )}
                >
                    <Icons.profile className="size-6" />
                </Link>

            </div>
        </nav>
    );
};

export default BottomBar;