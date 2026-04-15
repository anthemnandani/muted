'use client';

import { cn } from '@/lib/utils';
import useAddGif from '@/store/addGif';
import { IGif } from '@giphy/js-types';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import debounce from 'lodash/debounce';
import { ArrowLeft, Search } from 'lucide-react';
import React from 'react';
import SearchGiphy from '../cards/SearchGiphy';
import TrendingGiphy from '../cards/TrendingGiphy';
import { Icons } from '../icons';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import useBreakpoint from '@/hooks/useBreakpoint';

interface GifPickerProps {
  onGifSelect: (gif: IGif) => void;
}

const LoaderComponent = () => (
  <div className='flex-center w-full py-4'>
    <Icons.loading className='size-11' />
  </div>
);

const GifPicker: React.FC<GifPickerProps> = ({ onGifSelect }) => {
  const { isTablet, isMobile } = useBreakpoint();
  const { openGifPicker, setOpenGifPicker } = useAddGif();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [debouncedTerm, setDebouncedTerm] = React.useState('');

  const debouncedSearch = React.useCallback(
    debounce((term: string) => {
      setDebouncedTerm(term);
    }, 500),
    [],
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const getGridWidth = () => {
    if (isMobile) {
      return window.innerWidth - 32;
    }
    if (isTablet) {
      return 600;
    }
    return Math.min(668, window.innerWidth - 48);
  };

  React.useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <Dialog open={openGifPicker} onOpenChange={setOpenGifPicker}>
      <DialogTrigger asChild>
        <div className='text-white/50 flex gap-1 select-none items-center text-[15px]'>
          <Icons.gif className='size-5 select-none transform active:scale-75 transition-transform cursor-pointer' />
        </div>
      </DialogTrigger>
      <DialogContent
        className={cn(
          'w-full md:max-w-[668px]',
          'select-none border-none bg-transparent shadow-none outline-none',
          'duration-300 ease-in-out transition-all',
          'motion-reduce:transition-none motion-reduce:transform-none',
        )}
      >
        <DialogHeader>
          <DialogTitle>
            <VisuallyHidden.Root>Add a gif</VisuallyHidden.Root>
          </DialogTitle>
        </DialogHeader>

        <Card className='rounded-none md:rounded-2xl h-full md:h-auto border-none bg-background shadow-2xl ring-1 ring-[#393939] ring-offset-0 dark:bg-gray-6'>
          <div className='border-b border-border p-4 flex items-center'>
            <Button
              onClick={() => {
                setOpenGifPicker(false);
                setSearchTerm('');
                setDebouncedTerm('');
              }}
              variant='ghost'
              size='icon'
              className='text-foreground'
            >
              <ArrowLeft className='size-5' />
            </Button>
            <h2 className='flex-1 text-center text-lg font-semibold'>
              Choose a GIF
            </h2>
          </div>

          <div className='p-4 border-b border-border'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground' />
              <Input
                placeholder='Search GIPHY'
                value={searchTerm}
                onChange={handleSearch}
                className='pl-10 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
              />
            </div>
          </div>

          <ScrollArea
            className='h-[calc(100vh-120px)] md:h-[60vh] overflow-y-auto p-4'
            type='always'
          >
            <div className='flex justify-center'>
              {debouncedTerm ? (
                <SearchGiphy
                  searchTerm={debouncedTerm}
                  onGifSelect={onGifSelect}
                  loader={LoaderComponent}
                  gridWidth={getGridWidth()}
                />
              ) : (
                <TrendingGiphy
                  onGifSelect={onGifSelect}
                  loader={LoaderComponent}
                  gridWidth={getGridWidth()}
                />
              )}
            </div>
          </ScrollArea>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default GifPicker;
