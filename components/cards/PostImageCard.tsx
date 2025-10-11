import { PostImageCardProps } from '@/lib/types';
import { getTargetRatio } from '@/lib/utils';
import PostFooter from '../posts/PostFooter';

const PostImageCard: React.FC<PostImageCardProps> = ({
  image,
  originalDimensions,
  aspectRatio,
  author,
  createdAt,
  id,
  text,
  reposts,
  repostedBy,
  mentions,
}) => {
  return (
    <div className='post-container-fitted'>
      <div className='relative w-full h-full flex-center'>
        <img
          alt='Post'
          loading='lazy'
          src={image}
          className='object-cover'
          style={{
            objectPosition: 'center',
            aspectRatio: getTargetRatio(aspectRatio!, originalDimensions),
          }}
        />
      </div>

      <div className='absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none' />
      <PostFooter
        author={author}
        createdAt={createdAt}
        id={id}
        text={text}
        reposts={reposts}
        repostedBy={repostedBy}
        mentions={mentions}
      />
    </div>
  );
};

export default PostImageCard;
