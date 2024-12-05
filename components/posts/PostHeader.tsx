import type { AuthorInfoProps } from '@/lib/types';
import { formatTimeAgo } from '@/lib/utils';
import ThreadActionMenu from '../menus/ThreadActionMenu';
import UserProfile from '../modals/UserProfile';
import Username from '../user/Username';

interface PostHeaderProps {
  author: AuthorInfoProps;
  createdAt: Date;
  id: string;
  repostedBy?: AuthorInfoProps;
  currentText: string;
  variant: 'default' | 'reply';
  hideLikes: boolean;
}

const PostHeader: React.FC<PostHeaderProps> = ({
  author,
  createdAt,
  id,
  repostedBy,
  currentText,
  variant,
  hideLikes,
}) => (
  <div className='flex justify-between w-full space-x-2 xs:space-x-4 px-2 md:px-4'>
    <UserProfile author={author} />
    <div className='flex-between w-full'>
      <ul className='flex flex-wrap content-center items-center text-sm text-gray-3 sm:content-baseline gap-1 sm:gap-2'>
        <Username author={author} />

        {variant === 'default' && (
          <>
            <li>
              <div className='hidden size-1 rounded-full bg-gray-3 sm:block'></div>
            </li>

            <li className='hidden hover:cursor-pointer hover:text-gray-2 sm:block'>
              <a href={`/@${author.username}`}>@{author.username}</a>
            </li>
            <li>
              <div className='hidden size-1 rounded-full bg-gray-3 sm:block'></div>
            </li>
          </>
        )}
        <li className='mr-2 sm:mr-0'>
          <a href={`/post/${id}`}>{formatTimeAgo(createdAt)}</a>
        </li>
      </ul>

      <ThreadActionMenu
        authorId={author.id}
        postId={id}
        repostedBy={repostedBy}
        createdAt={createdAt}
        currentText={currentText}
        hideLikes={hideLikes}
      />
    </div>
  </div>
);

export default PostHeader;
