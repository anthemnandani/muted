import { ThreadHeaderProps } from '@/lib/types';
import { formatTimeAgo } from '@/lib/utils';
import Link from 'next/link';
import ThreadActionMenu from '../menus/ThreadActionsMenu';
import UserProfile from '../modals/UserProfile';
import Username from '../user/Username';

const ThreadHeader: React.FC<ThreadHeaderProps> = ({
  author,
  createdAt,
  id,
  repostedBy,
  currentText,
  variant,
  hideLikes,
  mentions,
  privacy,
  linkPreview,
}) => (
  <div className='flex justify-between w-full space-x-2 xs:space-x-4 px-2 md:px-4'>
    <UserProfile author={author} />
    <div className='flex-between w-full'>
      <ul className='flex flex-wrap content-center items-center text-sm text-white/50 sm:content-baseline gap-1 sm:gap-2'>
        <Username author={author} />

        {variant === 'default' && (
          <>
            <li>
              <div className='hidden size-1 rounded-full bg-gray-3 sm:block'></div>
            </li>

            <li className='hidden hover:cursor-pointer hover:text-gray-2 sm:block'>
              <Link href={`/@${author.username}`}>@{author.username}</Link>
            </li>
            <li>
              <div className='hidden size-1 rounded-full bg-gray-3 sm:block'></div>
            </li>
          </>
        )}
        <li className='mr-2 sm:mr-0'>
          <Link href={`/thread/${id}`}>{formatTimeAgo(createdAt)}</Link>
        </li>
      </ul>

      <ThreadActionMenu
        authorId={author.id}
        username={author.username}
        id={id}
        repostedBy={repostedBy}
        createdAt={createdAt}
        currentText={currentText}
        hideLikes={hideLikes}
        mentions={mentions}
        privacy={privacy}
        linkPreview={linkPreview}
      />
    </div>
  </div>
);

export default ThreadHeader;
