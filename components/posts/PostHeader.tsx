import type { AuthorInfoProps } from '@/lib/types';
import { formatTimeAgo } from '@/lib/utils';
import ThreadActionMenu from '../menus/ThreadActionMenu';
import Username from '../user/Username';

interface PostHeaderProps {
  author: AuthorInfoProps;
  createdAt: Date;
  id: string;
  repostedBy?: AuthorInfoProps;
}

const PostHeader: React.FC<PostHeaderProps> = ({
  author,
  createdAt,
  id,
  repostedBy,
}) => (
  <div className='flex-between gap-5 py-px w-full max-md:max-w-full max-md:flex-wrap'>
    <div className='flex items-center gap-2'>
      <Username author={author} />
      <time className='text-[15px] leading-none text-gray-3'>
        {formatTimeAgo(createdAt)}
      </time>
    </div>
    <ThreadActionMenu
      authorId={author.id}
      postId={id}
      repostedBy={repostedBy}
    />
  </div>
);

export default PostHeader;
