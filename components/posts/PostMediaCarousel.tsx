'use client';

import { PostMediaCarouselProps } from '@/lib/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import PostImageCard from '../cards/PostImageCard';
import PostVideoCard from '../cards/PostVideoCard';
import { Button } from '../ui/button';
import 'swiper/css';
import 'swiper/css/pagination';

const PostMediaCarousel: React.FC<PostMediaCarouselProps> = ({
  media,
  author,
  createdAt,
  postId,
  text,
  hideLikes,
  pinned,
}) => {
  const [swiperRef, setSwiperRef] = React.useState<SwiperType>();
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const handleSlideChange = (swiper: SwiperType) => {
    setCurrentIndex(swiper.activeIndex);
  };
  return (
    <div className='w-full max-w-[calc((0px-2rem+100vh)*0.5625)] h-[calc(0px-2rem+100vh)] relative snap-center snap-always'>
      <Swiper
        pagination={{ clickable: true }}
        className='h-full w-full'
        onSwiper={setSwiperRef}
        onSlideChange={handleSlideChange}
      >
        {media?.map((item, index) => (
          <SwiperSlide key={`${postId}-${index}`}>
            {item.fileType === 'video' ? (
              <PostVideoCard
                video={item.fileUrl}
                poster={item.thumbnailUrl!}
                aspectRatio={item.aspectRatio}
                postId={postId}
                author={author}
                createdAt={createdAt}
                text={text}
                hideLikes={hideLikes}
                pinned={pinned}
              />
            ) : (
              <PostImageCard
                image={item.fileUrl}
                originalDimensions={item.originalDimensions}
                author={author}
                createdAt={createdAt}
                id={postId}
                text={text}
                hideLikes={hideLikes}
                pinned={pinned}
              />
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      {media?.length > 1 && (
        <React.Fragment>
          {currentIndex > 0 && (
            <Button
              variant='ghost'
              size='icon'
              className='absolute size-8 left-2 top-1/2 -translate-y-1/2 rounded-full bg-zinc-800 hover:bg-zinc-800/75 z-50'
              onClick={() => swiperRef?.slidePrev()}
            >
              <ChevronLeft className='size-4' />
            </Button>
          )}
          {currentIndex < media?.length - 1 && (
            <Button
              variant='ghost'
              size='icon'
              className='absolute size-8 right-2 top-1/2 -translate-y-1/2 rounded-full bg-zinc-800 hover:bg-zinc-800/75 z-50'
              onClick={() => swiperRef?.slideNext()}
            >
              <ChevronRight className='size-4' />
            </Button>
          )}
        </React.Fragment>
      )}
    </div>
  );
};

export default PostMediaCarousel;
