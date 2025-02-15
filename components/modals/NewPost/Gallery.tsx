'use client';

import { UPLOAD_CONSTRAINTS } from '@/lib/constants';
import { GalleryProps } from '@/lib/types';
import usePostDialog from '@/store/postDialog';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import SortableMedia from './SortableMedia';

const Gallery = ({
  mediaFiles,
  setMediaFiles,
  getRootProps,
  getInputProps,
  isDragActive,
  onRemove,
}: GalleryProps) => {
  const { currentMediaIndex, setCurrentMediaIndex } = usePostDialog();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = mediaFiles.findIndex((item) => item.id === active.id);
    const newIndex = mediaFiles.findIndex((item) => item.id === over.id);

    const newItems = arrayMove(mediaFiles, oldIndex, newIndex);
    setCurrentMediaIndex(0);
    setMediaFiles(newItems);
  };

  return (
    <div className='absolute bottom-16 right-4 p-4 bg-neutral-800 shadow-2xl rounded-lg'>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={mediaFiles.map((file) => file.id)}
          strategy={rectSortingStrategy}
        >
          <div className='grid grid-cols-3 gap-2 max-w-[240px]'>
            {mediaFiles.map((file, index) => (
              <SortableMedia
                key={file.id}
                file={file}
                index={index}
                isActive={currentMediaIndex === index}
                onClick={() => setCurrentMediaIndex(index)}
                onRemove={onRemove}
              />
            ))}
            {mediaFiles.length < UPLOAD_CONSTRAINTS.MAX_ITEMS && (
              <div className='aspect-square w-[72px] h-[72px] rounded-md'>
                <div {...getRootProps()} className='h-full w-full'>
                  <input {...getInputProps()} />
                  <div className='h-full w-full rounded-md border border-neutral-600 bg-zinc-800 hover:bg-zinc-800/75 transition-all flex-center cursor-pointer'>
                    {isDragActive ? (
                      <div className='absolute inset-0 bg-primary-blue/10 rounded-md border-2 border-primary-blue border-dashed' />
                    ) : (
                      <Plus className='size-6 text-neutral-400' />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
      <div className='mt-2 text-xs text-center text-neutral-400'>
        Click and drag to reorder
      </div>
    </div>
  );
};

export default Gallery;
