import { Icons } from '@/components/icons';
import { Separator } from '@/components/ui/separator';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

const SearchQueryOption = ({ searchQuery }: { searchQuery: string }) => {
  return (
    <Link href={`/search?q=${encodeURIComponent(searchQuery.trim())}`}>
      <div className='flex w-full mt-5'>
        <div className='size-10 flex-center'>
          <Icons.search className='size-4 text-[#b8b8b8] dark:text-[#4d4d4d]' />
        </div>
        <div className='flex flex-col flex-1 ml-3'>
          <div className='flex-between w-full pb-4'>
            <span className='text-[15px] text-black dark:text-[#f3f5f7] antialiased break-words text-ellipsis'>
              {searchQuery}
            </span>
            <div className='pr-2 md:pr-4'>
              <ChevronRight className='size-6 text-[#b8b8b8] dark:text-[#4d4d4d] ' />
            </div>
          </div>
          <Separator className='w-full' />
        </div>
      </div>
    </Link>
  );
};

export default SearchQueryOption;
