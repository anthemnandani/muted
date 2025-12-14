'use client';

import useMediaControls from '@/hooks/useMediaControls';
import { PostMediaCarouselProps } from '@/lib/types';
import { cn, getTargetRatio } from '@/lib/utils';
import useCommentPanelStore from '@/store/commentPanel';
import { useState } from 'react';
import { type Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import { Swiper, SwiperSlide } from 'swiper/react';
import PostImageCard from '../cards/PostImageCard';
import PostVideoCard from '../cards/PostVideoCard';
import PostActionMenu from '../menus/PostActionMenu';
import CarouselNavigation from '../shared/CarouselNavigation';
import CarouselPagination from '../shared/CarouselPagination';
import PostFooter from './PostFooter';

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

  const firstMedia = media?.[0];
  let containerClass = 'post-container-portrait';
  const numericRatio = getTargetRatio(
    firstMedia?.aspectRatio,
    firstMedia?.originalDimensions
  );

  if (!isAdminPanel) {
    if (media.length > 1) {
      containerClass = 'post-container-portrait';
    } else if (numericRatio > 1.5) {
      containerClass = 'post-container-landscape';
    } else if (numericRatio > 1.1) {
      containerClass = 'post-container-four-three';
    } else if (numericRatio >= 0.9) {
      containerClass = 'post-container-square';
    } else if (numericRatio >= 0.7) {
      containerClass = 'post-container-four-five';
    }
  } else {
    containerClass = 'relative h-full w-full';
  }

  const handleSlideChange = (swiper: SwiperType) => {
    setCurrentIndex(swiper.activeIndex);
  };

  const shouldAnimate = numericRatio >= 0.9;
  const isShrunkView =
    useCommentPanelStore.getState().isPanelOpen &&
    !isAdminPanel &&
    shouldAnimate &&
    media.length === 1;

  return (
    <div
      className={cn(
        containerClass,
        shouldAnimate &&
          'transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]',
        isShrunkView && 'xl:max-w-[45vw]'
      )}
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
        className='h-full w-full'
        onSwiper={setSwiperRef}
        onSlideChange={handleSlideChange}
        noSwiping={true}
        noSwipingClass='swiper-no-swiping'
        preventInteractionOnTransition={true}
      >
        {media?.map((item, index) => (
          <SwiperSlide key={`${postId}-${index}`}>
            {item.fileType === 'video' ? (
              <PostVideoCard
                playbackId={item.playbackId!}
                encodingStatus={item.encodingStatus}
                videoToken={item.videoToken}
                thumbnailToken={item.thumbnailToken}
                aspectRatio={item.aspectRatio}
                originalDimensions={item.originalDimensions}
                postId={postId}
                showControls={showControls}
              />
            ) : (
              <PostImageCard
                image={item.fileUrl!}
                isAdminPanel={isAdminPanel}
              />
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      <div
        className='absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 
      to-transparent z-10 pointer-events-none'
      />

      <div className='absolute bottom-0 left-0 right-0 z-20'>
        <PostFooter
          author={author}
          createdAt={createdAt}
          id={postId}
          text={text}
          reposts={reposts}
          repostedBy={repostedBy}
          mentions={mentions}
        />
      </div>

      <CarouselNavigation
        selectedIndex={currentIndex}
        totalCount={media?.length || 0}
        onPrev={() => swiperRef?.slidePrev()}
        onNext={() => swiperRef?.slideNext()}
      />

      <CarouselPagination
        selectedIndex={currentIndex}
        totalCount={media?.length || 0}
        onSelect={(index) => swiperRef?.slideTo(index)}
      />
    </div>
  );
};

export default PostMediaCarousel;
