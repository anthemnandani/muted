'use client';

import useMediaControls from '@/hooks/useMediaControls';
import { AspectRatio, PostMediaCarouselProps } from '@/lib/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Fragment, useState } from 'react';
import { type Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';
import { Swiper, SwiperSlide } from 'swiper/react';
import PostImageCard from '../cards/PostImageCard';
import PostVideoCard from '../cards/PostVideoCard';
import PostActionMenu from '../menus/PostActionMenu';
import { Button } from '../ui/button';

const PostMediaCarousel: React.FC<PostMediaCarouselProps> = ({
  media,
  author,
  createdAt,
  postId,
  text,
  pinned,
  reposts,
  repostedBy,
  mentions,
  hideLikes,
  turnOffComments,
  isAdminPanel = false,
}) => {
  const [swiperRef, setSwiperRef] = useState<SwiperType>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const {
    showControls,
    setShowControls,
    showControlsTemporarily,
    controlsTimeoutRef,
  } = useMediaControls();

  const handleSlideChange = (swiper: SwiperType) => {
    setCurrentIndex(swiper.activeIndex);
  };
  return (
    <div
      className={isAdminPanel ? 'relative h-full w-full' : 'post-container'}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => {
        setShowControls(false);
      }}
      onTouchStart={showControlsTemporarily}
      onTouchMove={() => {
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
      }}
    >
      {!isAdminPanel && (
        <div className='absolute top-2 right-4 z-50'>
          <PostActionMenu
            author={author}
            postId={postId}
            createdAt={createdAt}
            caption={text}
            showControls={showControls}
            turnOffComments={turnOffComments ?? false}
            hideLikes={hideLikes ?? false}
            pinned={pinned}
            media={media}
          />
        </div>
      )}
      <Swiper
        pagination={{ clickable: true }}
        className='h-full w-full'
        onSwiper={setSwiperRef}
        onSlideChange={handleSlideChange}
        noSwiping={true}
        noSwipingClass='video-js'
        preventInteractionOnTransition={true}
      >
        {media?.map((item, index) => (
          <SwiperSlide key={`${postId}-${index}`} className='swiper-no-swiping'>
            {item.fileType === 'video' ? (
              <PostVideoCard
                video={item.fileUrl}
                poster={item.thumbnailUrl!}
                encodingStatus={item.encodingStatus}
                postId={postId}
                author={author}
                createdAt={createdAt}
                mentions={mentions}
                text={text}
                reposts={reposts}
                repostedBy={repostedBy}
                showControls={showControls}
              />
            ) : (
              <PostImageCard
                image={item.fileUrl}
                originalDimensions={item.originalDimensions}
                aspectRatio={item.aspectRatio as AspectRatio}
                author={author}
                createdAt={createdAt}
                mentions={mentions}
                id={postId}
                text={text}
                reposts={reposts}
                repostedBy={repostedBy}
                isAdminPanel={isAdminPanel}
              />
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      {media?.length > 1 && (
        <Fragment>
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
        </Fragment>
      )}
    </div>
  );
};

export default PostMediaCarousel;
