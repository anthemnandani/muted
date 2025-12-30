import { PostImageCardProps } from '@/lib/types';
import { getTargetRatio } from '@/lib/utils';

const PostImageCard: React.FC<PostImageCardProps> = ({
  image,
  aspectRatio,
  originalDimensions,
  isCarousel,
  text,
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
      <img
        alt={text ?? ''}
        loading='lazy'
        src={image}
        className='object-cover'
        style={{
          aspectRatio: numericRatio,
          width: shouldUseAutoWidth ? 'auto' : '100%',
          height:
            (isCarousel && !isModal) || shouldUseAutoHeight ? 'auto' : '100%',
        }}
      />
    </div>
  );
};

export default PostImageCard;
