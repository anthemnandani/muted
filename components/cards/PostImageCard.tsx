import { PostImageCardProps } from '@/lib/types';
import { cn, getTargetRatio } from '@/lib/utils';
import PostFooter from '../posts/PostFooter';

const PostImageCard: React.FC<PostImageCardProps> = ({
  image,
  aspectRatio,
  author,
  createdAt,
  id,
  text,
  reposts,
  repostedBy,
  mentions,
  isAdminPanel = false,
}) => {
  return (
    <div
      className={cn({
        'post-container-fitted': !isAdminPanel,
      })}
    >
      <div className='relative w-full h-full'>
        <img
          alt='Post'
          loading='lazy'
          src={image}
          className='object-cover'
          style={{
            aspectRatio: getTargetRatio(aspectRatio),
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
