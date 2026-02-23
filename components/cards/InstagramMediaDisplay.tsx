'use client';

import { Media } from '@/generated/prisma/client';
import { FileType } from '@/generated/prisma/enums';
import {
  InstagramMediaDisplayProps,
  type OriginalDimensions,
} from '@/lib/types';
import { cn, getInstagramFeedRatio } from '@/lib/utils';
import { Fragment, useMemo, useState } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import { Swiper, SwiperSlide } from 'swiper/react';
import CarouselPagination from '../shared/CarouselPagination';
import InstagramVideoSlide from '../shared/InstagramVideoSlide';
import HiddenPost from './HiddenPost';
import MutedPost from './MutedPost';
import { Icons } from '../icons';

const InstagramMediaDisplay: React.FC<InstagramMediaDisplayProps> = ({
  media,
  postId,
  text,
  username,
  userId,
  isHidden,
  isMuted,
}) => {
  const [swiperRef, setSwiperRef] = useState<SwiperType>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const firstMedia = media[0];
  const containerRatio = useMemo(
    () =>
      getInstagramFeedRatio(
        firstMedia?.aspectRatio,
        firstMedia?.originalDimensions as OriginalDimensions,
      ),
    [firstMedia?.aspectRatio, firstMedia?.originalDimensions],
  );
  const isCarousel = media.length > 1;
  const renderSlide = (item: Media, index: number) => {
    if (item.fileType === FileType.VIDEO) {
      return (
        <InstagramVideoSlide
          key={`${postId}-v-${index}`}
          playbackId={item.playbackId!}
          videoToken={item.videoToken!}
          thumbnailToken={item.thumbnailToken!}
          postId={postId}
          isActive={!isCarousel || currentIndex === index}
        />
      );
    }
    return (
      <img
        key={`${postId}-i-${index}`}
        src={item.fileUrl!}
        alt={text ?? ''}
        loading={index === 0 ? 'eager' : 'lazy'}
        className='w-full h-full object-cover'
      />
    );
  };

  const isFirstItem = currentIndex === 0;
  const isLastItem = currentIndex === media.length - 1;
  return (
    <div className='relative w-full bg-black overflow-hidden'>
      <div
        style={{ aspectRatio: containerRatio, width: '100%' }}
        className='relative'
      >
        {isHidden ? (
          <HiddenPost postId={postId} />
        ) : isMuted ? (
          <MutedPost userId={userId} username={username} />
        ) : (
          <Fragment>
            {!isCarousel && renderSlide(firstMedia, 0)}
            {isCarousel && (
              <Swiper
                className='h-full w-full relative'
                onSwiper={setSwiperRef}
                onSlideChange={(s) => setCurrentIndex(s.activeIndex)}
              >
                {media.map((item, i) => (
                  <SwiperSlide key={`${postId}-s-${i}`}>
                    <div className='w-full h-full'>{renderSlide(item, i)}</div>
                  </SwiperSlide>
                ))}
                <Fragment>
                  <button
                    type='button'
                    aria-label='Left'
                    className={cn(
                      'navigator-btn absolute top-1/2 left-4 -translate-y-1/2 size-8 bg-black/50 hover:bg-black/40',
                      isFirstItem && 'cursor-not-allowed opacity-40',
                    )}
                    disabled={isFirstItem}
                    onClick={() => swiperRef?.slidePrev()}
                  >
                    <Icons.chevronLeft className='size-5 text-white/90 font-medium' />
                  </button>
                  <button
                    type='button'
                    aria-label='Right'
                    className={cn(
                      'navigator-btn absolute top-1/2 right-4 -translate-y-1/2 size-8 bg-black/50 hover:bg-black/40',
                      isLastItem && 'cursor-not-allowed opacity-40',
                    )}
                    disabled={isLastItem}
                    onClick={() => swiperRef?.slideNext()}
                  >
                    <Icons.chevronRight className='size-5 text-white/90 font-medium' />
                  </button>
                </Fragment>
              </Swiper>
            )}
          </Fragment>
        )}
      </div>
      {isCarousel && !isHidden && !isMuted && (
        <div className='flex justify-center py-2'>
          <CarouselPagination
            selectedIndex={currentIndex}
            totalCount={media.length}
            onSelect={(i) => swiperRef?.slideTo(i)}
          />
        </div>
      )}
    </div>
  );
};
export default InstagramMediaDisplay;
