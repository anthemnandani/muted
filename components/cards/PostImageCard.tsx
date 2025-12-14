import { PostImageCardProps } from '@/lib/types';

const PostImageCard: React.FC<PostImageCardProps> = ({
  image,
  isAdminPanel = false,
}) => {
  return (
    <div className={isAdminPanel ? '' : 'post-container-fitted'}>
      <img
        alt='Post'
        loading='lazy'
        src={image}
        className='object-cover w-full'
      />
    </div>
  );
};

export default PostImageCard;
