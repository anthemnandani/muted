'use client';

import useDevice from '@/hooks/useDevice';
import { cn } from '@/lib/utils';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { useDropzone } from 'react-dropzone';
import CreateThreadDesktop from '../buttons/CreateThreadDesktop';
import CreateThreadMobile from '../buttons/CreateThreadMobile';
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
import useEmblaCarousel from 'embla-carousel-react';

type MediaFile = {
  file: File;
  preview: string;
  id: string;
};

interface SortableImageProps {
  file: MediaFile;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

const SortableImage = ({
  file,
  index,
  isActive,
  onClick,
}: SortableImageProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: file.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative aspect-square cursor-pointer rounded-md overflow-hidden',
        isActive && 'ring-2 ring-blue-500'
      )}
      {...attributes}
      {...listeners}
      onClick={onClick}
    >
      <img
        src={file.preview}
        className='h-full w-full object-cover'
        alt={`Preview ${index + 1}`}
      />
    </div>
  );
};

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const NewPost = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [step, setStep] = React.useState<'upload' | 'preview'>('upload');
  const [mediaFiles, setMediaFiles] = React.useState<MediaFile[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [showGallery, setShowGallery] = React.useState(false);
  const { isMobile } = useDevice();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    containScroll: false,
    dragFree: false,
    loop: false,
    duration: 10, // Animation duration in milliseconds (lower = faster)
    skipSnaps: false,
  });
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: crypto.randomUUID(),
    }));

    setMediaFiles((prev) => {
      const updated = [...prev, ...newFiles].slice(0, MAX_IMAGES);
      if (updated.length > 0) {
        setStep('preview');
      }
      return updated;
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    },
    maxSize: MAX_FILE_SIZE,
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setMediaFiles((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return items;

      // Reorder the items
      const newItems = arrayMove([...items], oldIndex, newIndex);

      // Always set main image to first image in gallery
      setCurrentImageIndex(0);

      return newItems;
    });
  };

  // Cleanup blob URLs when component unmounts
  React.useEffect(() => {
    return () => {
      mediaFiles.forEach((file) => {
        try {
          URL.revokeObjectURL(file.preview);
        } catch (error) {
          console.error('Error revoking blob URL:', error);
        }
      });
    };
  }, []);

  React.useEffect(() => {
    if (emblaApi) {
      emblaApi.scrollTo(currentImageIndex);
    }
  }, [currentImageIndex, emblaApi]);

  // Update currentImageIndex when carousel scrolls
  React.useEffect(() => {
    if (emblaApi) {
      emblaApi.on('select', () => {
        setCurrentImageIndex(emblaApi.selectedScrollSnap());
      });
    }
  }, [emblaApi]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        {isMobile ? (
          <CreateThreadMobile />
        ) : (
          <React.Fragment>
            <div className='hidden md:flex relative w-15 h-12 flex-center rounded-xl bg-primary transition-colors duration-150 border-none text-secondary hover:text-foreground'>
              <Icons.plus className='size-6' />
            </div>
            <CreateThreadDesktop />
          </React.Fragment>
        )}
      </DialogTrigger>
      <DialogContent className='w-full border-none bg-transparent shadow-none outline-none'>
        <DialogHeader>
          <DialogTitle className='flex items-center justify-between px-4'>
            {step === 'preview' && (
              <button
                type='button'
                className='font-normal'
                onClick={() => setStep('upload')}
              >
                <Icons.cancel className='size-5 text-white' />
              </button>
            )}

            <span className='flex-1 text-center text-base font-bold text-white'>
              {step === 'upload' ? 'Create new post' : 'Preview'}
            </span>
            {step === 'preview' && (
              <span
                className='text-primary-blue text-base font-normal cursor-pointer'
                onClick={() => {
                  /* Implement next step */
                }}
              >
                Next
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <Card className='relative rounded-2xl border-none shadow-2xl ring-1 ring-[#393939] bg-gray-6'>
          {step === 'upload' ? (
            <div className='p-6'>
              <div
                {...getRootProps()}
                className='flex flex-col items-center justify-center p-6 transition-colors'
              >
                <input {...getInputProps()} />
                <Icons.media
                  className={cn(
                    'mb-4 w-24 h-[77px] text-neutral-100',
                    isDragActive && 'opacity-50'
                  )}
                />
                <span className='text-base sm:text-xl text-neutral-100 text-center'>
                  Drag photos and videos here
                </span>
                <Button
                  className='bg-primary-blue hover:bg-primary-blue/90 text-neutral-100 transition-colors duration-150 mt-4 sm:mt-6'
                  variant='default'
                >
                  Select from computer
                </Button>
              </div>
            </div>
          ) : (
            <div className='relative aspect-square bg-gray-6 rounded-2xl'>
              {/* Main Image */}
              <div className='relative h-full overflow-hidden' ref={emblaRef}>
                <div className='flex h-full touch-pan-y'>
                  {mediaFiles.map((file, index) => (
                    <div
                      key={file.id}
                      className='flex-[0_0_100%] min-w-0 relative h-full'
                    >
                      <img
                        src={file.preview}
                        className='h-full w-full object-contain'
                        alt={`Preview ${index + 1}`}
                        draggable={false}
                      />
                    </div>
                  ))}
                </div>

                {/* Navigation Arrows */}
                {mediaFiles.length > 1 && (
                  <>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/75'
                      onClick={() =>
                        setCurrentImageIndex((prev) => Math.max(0, prev - 1))
                      }
                      disabled={currentImageIndex === 0}
                    >
                      <ChevronLeft className='size-6' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/75'
                      onClick={() =>
                        setCurrentImageIndex((prev) =>
                          Math.min(mediaFiles.length - 1, prev + 1)
                        )
                      }
                      disabled={currentImageIndex === mediaFiles.length - 1}
                    >
                      <ChevronRight className='size-6' />
                    </Button>
                  </>
                )}

                {/* Gallery Toggle Button */}
                <Button
                  variant='ghost'
                  size='icon'
                  className='absolute bottom-4 right-4 rounded-full bg-black/50 hover:bg-black/75'
                  onClick={() => setShowGallery(!showGallery)}
                >
                  <Plus className='size-5' />
                </Button>

                {/* Gallery Overlay */}
                {showGallery && (
                  <div className='absolute bottom-16 right-4 p-2 bg-black/75 rounded-lg'>
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
                            <SortableImage
                              key={file.id}
                              file={file}
                              index={index}
                              isActive={currentImageIndex === index}
                              onClick={() => setCurrentImageIndex(index)}
                            />
                          ))}
                          {mediaFiles.length < MAX_IMAGES && (
                            <div className='aspect-square w-[72px] h-[72px] rounded-md'>
                              {/* Fixed size to match thumbnails */}
                              <div
                                {...getRootProps()}
                                className='h-full w-full'
                              >
                                <input {...getInputProps()} />
                                <div className='h-full w-full rounded-md border border-neutral-600 bg-black/50 hover:bg-black/75 transition-all flex items-center justify-center cursor-pointer'>
                                  <Plus className='size-6 text-neutral-400' />
                                </div>
                              </div>
                              {isDragActive && (
                                <div className='absolute inset-0 bg-neutral-700/50 rounded-md flex items-center justify-center'>
                                  <span className='text-xs text-neutral-300'>
                                    Drop here
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </SortableContext>
                    </DndContext>
                    <div className='mt-2 text-xs text-center text-neutral-400'>
                      Click and drag to reorder
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default NewPost;
