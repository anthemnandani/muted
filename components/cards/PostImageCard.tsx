import { PostImageCardProps } from '@/lib/types';
import PostFooter from '../posts/PostFooter';

const PostImageCard: React.FC<PostImageCardProps> = ({
  image,
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
    <div className={isAdminPanel ? '' : 'post-container-fitted'}>
      <img alt='Post' loading='lazy' src={image} className='object-cover' />

      <div className='absolute z-10 inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none' />
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
