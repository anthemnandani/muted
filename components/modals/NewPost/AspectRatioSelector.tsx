'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type AspectRatio, AspectRatioSelectorProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import usePostDialog from '@/store/postDialog';
import useFileStore from '@/store/fileStore';
import { Image } from 'lucide-react';

const AspectRatioSelector = ({
  selectedRatio,
  onChange,
}: AspectRatioSelectorProps) => {
  const { currentMediaIndex } = usePostDialog();
  const { mediaFiles } = useFileStore();

  const currentFile = mediaFiles[currentMediaIndex];
  const isVideo = currentFile?.type === 'video';

  const imageRatios: {
    value: AspectRatio;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      value: 'original',
      label: 'Original',
      icon: <Image className='size-6' />,
    },
    {
      value: '1:1',
      label: '1:1',
      icon: <Icons.square className='size-6' />,
    },
    {
      value: '4:5',
      label: '4:5',
      icon: <Icons.portrait className='size-6' />,
    },
    {
      value: '9:16',
      label: '9:16',
      icon: <Icons.portrait className='size-6' />,
    },
  ];

  const videoRatios: {
    value: AspectRatio;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      value: 'original',
      label: 'Original',
      icon: <Image className='size-6' />,
    },
    {
      value: '1:1',
      label: '1:1',
      icon: <Icons.square className='size-6' />,
    },
    {
      value: '9:16',
      label: '9:16',
      icon: <Icons.portrait className='size-6' />,
    },
    {
      value: '16:9',
      label: '16:9',
      icon: <Icons.landscape className='size-6' />,
    },
  ];

  const ratios = isVideo ? videoRatios : imageRatios;

  const { showRatioSelector, setShowRatioSelector, showGallery } =
    usePostDialog();

  return (
    <DropdownMenu open={showRatioSelector} onOpenChange={setShowRatioSelector}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='rounded-full opacity-100 bg-[#1A1A1ACC] hover:opacity-70 transition-all duration-200 size-8'
          title={isVideo ? 'Crop video' : 'Crop image'}
          disabled={showGallery}
        >
          <Icons.crop className='size-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side='top'
        align='start'
        sideOffset={8}
        className='z-[9999] w-auto p-0 bg-transparent border-none shadow-none'
      >
        <div className='bg-[#1A1A1ACC] rounded-lg min-w-[120px]'>
          <div className='flex flex-col'>
            {ratios.map((ratio, index) => (
              <button
                key={ratio.value}
                className={cn(
                  'transition-all duration-200',
                  index !== ratios.length - 1 && 'border-b border-black/40',
                  selectedRatio === ratio.value
                    ? 'opacity-100'
                    : 'opacity-80 hover:opacity-90'
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(ratio.value);
                }}
              >
                <div className='flex items-center gap-2 p-2 pl-3 cursor-pointer'>
                  <span
                    className={`text-sm ${
                      selectedRatio === ratio.value
                        ? 'text-white font-semibold'
                        : 'text-gray-400 font-medium'
                    }`}
                  >
                    {ratio.label}
                  </span>
                  <div
                    className={`p-1 ${
                      selectedRatio === ratio.value
                        ? 'text-white'
                        : 'text-gray-300'
                    }`}
                  >
                    {ratio.icon}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AspectRatioSelector;
