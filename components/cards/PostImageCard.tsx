import { PostImageCardProps } from '@/lib/types';
import { getTargetRatio } from '@/lib/utils';
import CarouselNavigation from '../shared/CarouselNavigation';
import CarouselPagination from '../shared/CarouselPagination';

const PostImageCard: React.FC<PostImageCardProps> = ({
  image,
  aspectRatio,
  originalDimensions,
  isCarousel,
  totalCount,
  currentIndex,
  swiperRef,
  isAdminPanel = false,
  isModal = false,
}) => {
  const numericRatio = getTargetRatio(aspectRatio, originalDimensions);
  const isLandscape = numericRatio > 1;
  const isPortrait = numericRatio <= 1;

  const shouldUseAutoHeight = isModal && isLandscape;
  const shouldUseAutoWidth = isModal && isPortrait;

  return (
    <div
      className={isAdminPanel ? '' : 'post-container-fitted swiper-no-swiping'}
    >
      <div
        className='relative flex-center'
        style={{
          aspectRatio: numericRatio,
          width: shouldUseAutoWidth ? 'auto' : '100%',
          height:
            (isCarousel && !isModal) || shouldUseAutoHeight ? 'auto' : '100%',
        }}
      >
        <img
          alt='Post'
          loading='lazy'
          src={image}
          className='object-cover w-full h-full'
        />

        {!isModal && (
          <CarouselNavigation
            selectedIndex={currentIndex}
            totalCount={totalCount || 0}
            onPrev={() => swiperRef?.slidePrev()}
            onNext={() => swiperRef?.slideNext()}
          />
        )}
      </div>
    </div>
  );
};

export default PostImageCard;
