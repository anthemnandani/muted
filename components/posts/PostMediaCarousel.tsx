'use client';

import useMediaControls from '@/hooks/useMediaControls';
import { PostMediaCarouselProps } from '@/lib/types';
import { getTargetRatio } from '@/lib/utils';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';
import PostImageCard from '../cards/PostImageCard';
import PostVideoCard from '../cards/PostVideoCard';
import PostActionMenu from '../menus/PostActionMenu';
import CarouselNavigation from '../shared/CarouselNavigation';

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
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    duration: 20,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  const {
    showControls,
    setShowControls,
    showControlsTemporarily,
    controlsTimeoutRef,
  } = useMediaControls();

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );

  const onSelect = useCallback((api: any) => {
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const firstMedia = media?.[0];
  const numericRatio = getTargetRatio(firstMedia?.aspectRatio);

  let containerClass = 'post-container-portrait';

  if (!isAdminPanel) {
    if (numericRatio === 1) {
      containerClass = 'post-container-square';
    } else if (numericRatio > 1) {
      containerClass = 'post-container-landscape';
    }
  } else {
    containerClass = 'relative h-full w-full';
  }

  return (
    <div
      className={containerClass}
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
      <div
        className='overflow-hidden w-full h-full rounded-2xl bg-black'
        ref={emblaRef}
      >
        <div className='flex w-full h-full touch-pan-y'>
          {media?.map((item, index) => (
            <div
              key={`${postId}-${index}`}
              className='flex-[0_0_100%] min-w-0 relative w-full h-full'
            >
              {item.fileType === 'video' ? (
                <PostVideoCard
                  playbackId={item.playbackId!}
                  encodingStatus={item.encodingStatus}
                  videoToken={item.videoToken}
                  thumbnailToken={item.thumbnailToken}
                  aspectRatio={item.aspectRatio}
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
                  image={item.fileUrl!}
                  aspectRatio={item.aspectRatio}
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
            </div>
          ))}
        </div>

        <CarouselNavigation
          selectedIndex={selectedIndex}
          totalCount={media?.length || 0}
          onPrev={scrollPrev}
          onNext={scrollNext}
        />
      </div>
    </div>
  );
};

export default PostMediaCarousel;
