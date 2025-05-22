'use client';

import { Icons } from '@/components/icons';
import { AspectRatioSelectorProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Image } from 'lucide-react';

const AspectRatioSelector = ({
  selectedRatio,
  onChange,
}: AspectRatioSelectorProps) => {
  const ratios = [
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
      value: '16:9',
      label: '16:9',
      icon: <Icons.landscape className='size-6' />,
    },
  ];

  return (
    <div className='absolute bottom-16 left-4 z-20'>
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
              onClick={() => onChange(ratio.value)}
            >
              <div className='flex items-center gap-2 p-2 pl-3'>
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
    </div>
  );
};

export default AspectRatioSelector;
