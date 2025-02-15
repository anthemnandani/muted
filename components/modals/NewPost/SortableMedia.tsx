'use client';

import type { SortableMediaProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Play, X } from 'lucide-react';
import React from 'react';

const SortableMedia = ({
  file,
  index,
  isActive,
  onClick,
  onRemove,
}: SortableMediaProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: file.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(file.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative aspect-square w-18 h-18 cursor-pointer rounded-md overflow-hidden group',
        isActive && 'ring-2 ring-neutral-100'
      )}
      onClick={onClick}
    >
      <div
        {...attributes}
        {...listeners}
        className='absolute top-1 left-1 z-10 size-4 rounded-full bg-black/60 hover:bg-black/80 flex-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab'
      >
        <GripVertical className='size-3 text-neutral-100' />
      </div>

      <button
        onClick={handleRemove}
        className='absolute top-1 right-1 z-10 size-4 rounded-full bg-black/60 hover:bg-black/80 flex-center opacity-0 group-hover:opacity-100 transition-opacity'
        aria-label='Remove media'
        type='button'
      >
        <X className='size-3 text-neutral-100' />
      </button>

      {file.type === 'image' ? (
        <img
          src={file.preview}
          className='h-full w-full object-cover'
          alt={`Preview ${index + 1}`}
        />
      ) : (
        <React.Fragment>
          <div className='relative h-full w-full'>
            <video
              src={file.preview}
              className='h-full w-full object-cover'
              playsInline
              muted
            />
            <div className='absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors'>
              <div className='absolute inset-0 flex items-center justify-center'>
                <Play className='size-4 text-neutral-100 fill-neutral-100' />
              </div>
            </div>
          </div>
        </React.Fragment>
      )}
    </div>
  );
};

export default SortableMedia;
