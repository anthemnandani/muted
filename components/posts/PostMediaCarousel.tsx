'use client';

import { FileType } from '@/generated/prisma/enums';
import useMediaControls from '@/hooks/useMediaControls';
import {
  type MuxPlayerRef,
  type OriginalDimensions,
  PostMediaCarouselProps,
} from '@/lib/types';
import { cn, getTargetRatio } from '@/lib/utils';
import useCommentPanelStore from '@/store/commentPanel';
import { useRef, useState } from 'react';
import { type Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import { Swiper, SwiperSlide } from 'swiper/react';
import NavigationButtons from '../buttons/NavigationButtons';
import PostImageCard from '../cards/PostImageCard';
import PostVideoCard from '../cards/PostVideoCard';
import PostActionMenu from '../menus/PostActionMenu';
import CarouselPagination from '../shared/CarouselPagination';
import VolumeControls from '../shared/VolumeControls';
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
  onNavigate,
  isFirstPost,
  isLastPost,
  isFetchingMore,
  isAdminPanel = false,
  isModal = false,
}) => {
  const [swiperRef, setSwiperRef] = useState<SwiperType>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activePlayer, setActivePlayer] = useState<MuxPlayerRef | null>(null);
  const playersRegistry = useRef<Record<number, MuxPlayerRef | null>>({});

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
    firstMedia?.originalDimensions as OriginalDimensions,
  );

  if (!isAdminPanel && !isModal) {
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
    containerClass = 'relative h-full w-full flex-center';
  }

  const handleSlideChange = (swiper: SwiperType) => {
    const index = swiper.activeIndex;
    setCurrentIndex(index);
    setActivePlayer(playersRegistry.current[index] || null);
  };

  const handlePlayerRegister = (index: number, player: MuxPlayerRef | null) => {
    playersRegistry.current[index] = player;
    if (index === currentIndex) {
      setActivePlayer(player);
    }
  };

  const shouldAnimate = numericRatio >= 0.9;
  const isShrunkView =
    useCommentPanelStore.getState().isPanelOpen &&
    !isAdminPanel &&
    !isModal &&
    shouldAnimate &&
    media.length === 1;

  const effectiveShowControls = isModal ? true : showControls;

  return (
    <div
      className={cn(
        !isModal && 'relative rounded-2xl',
        containerClass,
        shouldAnimate &&
          'transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]',
        isShrunkView && 'xl:max-w-[45vw]',
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
        <div className={cn('absolute top-2 right-4 z-50', isModal && 'top-4')}>
          <PostActionMenu
            author={author}
            postId={postId}
            createdAt={createdAt}
            caption={text}
            showControls={effectiveShowControls}
            turnOffComments={turnOffComments ?? false}
            hideLikes={hideLikes ?? false}
            pinned={pinned}
            media={media}
            isModal={isModal}
          />
        </div>
      )}
      {isModal && activePlayer && (
        <div className='absolute bottom-4 right-4 z-50'>
          <VolumeControls
            player={activePlayer}
            showControls={effectiveShowControls}
            isVertical
          />
        </div>
      )}
      {onNavigate && (
        <NavigationButtons
          isFirstPost={isFirstPost!}
          isLastPost={isLastPost!}
          isLoading={isFetchingMore}
          handleNavigation={onNavigate}
        />
      )}
      <Swiper
        className='h-full w-full z-10'
        onSwiper={setSwiperRef}
        onSlideChange={handleSlideChange}
        noSwiping={true}
        noSwipingClass='swiper-no-swiping'
        preventInteractionOnTransition={true}
      >
        {media?.map((item, index) => (
          <SwiperSlide key={`${postId}-${index}`}>
            {item.fileType === FileType.VIDEO ? (
              <PostVideoCard
                playbackId={item.playbackId!}
                encodingStatus={item.encodingStatus}
                videoToken={item.videoToken}
                thumbnailToken={item.thumbnailToken}
                aspectRatio={item.aspectRatio}
                originalDimensions={
                  item.originalDimensions as OriginalDimensions
                }
                postId={postId}
                showControls={showControls}
                isCarousel={media?.length > 1}
                onPlayerRegister={(player) =>
                  handlePlayerRegister(index, player)
                }
                isModal={isModal}
              />
            ) : (
              <PostImageCard
                image={item.fileUrl!}
                isAdminPanel={isAdminPanel}
                aspectRatio={item.aspectRatio}
                originalDimensions={
                  item.originalDimensions as OriginalDimensions
                }
                text={text}
                isModal={isModal}
                isCarousel={media?.length > 1}
              />
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      {isModal && (
        <div className='flex absolute bottom-8 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto'>
          <CarouselPagination
            selectedIndex={currentIndex}
            totalCount={media?.length || 0}
            onSelect={(index) => swiperRef?.slideTo(index)}
          />
        </div>
      )}

      {!isModal && (
        <div className='absolute bottom-0 left-0 right-0 z-30'>
          <PostFooter
            author={author}
            createdAt={createdAt}
            id={postId}
            text={text}
            reposts={reposts}
            repostedBy={repostedBy}
            mentions={mentions}
            totalCount={media?.length}
            currentIndex={currentIndex}
            swiperRef={swiperRef}
          />
        </div>
      )}
    </div>
  );
};

export default PostMediaCarousel;
