import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useThreadRepost } from '@/hooks/useThreadRepost';
import { AuthorInfoProps, ThreadRepostButtonProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Fragment } from 'react';
import QuoteButton from './QuoteButton';

const ThreadRepostButton: React.FC<ThreadRepostButtonProps> = ({
  id,
  text,
  author,
  createdAt,
  reposts,
  media,
  linkPreview,
  mentions,
  quoteId,
  repostsCount,
  isCheckingPermissions,
  canInteract,
  isParentThread,
}) => {
  const {
    isRepostedByMe,
    repostsCount: mainRepostsCount,
    toggleRepost,
  } = useThreadRepost({
    reposts,
    initialRepostsCount: repostsCount,
    threadId: id,
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button className='icon-container-hover'>
          {isRepostedByMe ? (
            <Icons.threadReposted className='size-5' />
          ) : (
            <Icons.threadRepost className='size-5' />
          )}
          {mainRepostsCount > 0 && !isParentThread && (
            <span className='text-[13px] leading-4 text-center text-white/75 ml-2'>
              {mainRepostsCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='start'
        className='dropdown-content-container p-2 rounded-2xl w-[240px]'
      >
        {isCheckingPermissions ? (
          <div className='flex-center py-3.5 px-4'>
            <Icons.loading className='size-8' />
          </div>
        ) : (
          <Fragment>
            <DropdownMenuItem
              onClick={toggleRepost}
              className={cn(
                'dropdown-menu-item flex-between py-3.5 px-4 data-[disabled]:pointer-events-auto',
                {
                  'text-primary-red focus:text-primary-red': isRepostedByMe,
                },
              )}
            >
              {isRepostedByMe ? 'Remove' : 'Repost'}
              <Icons.threadRepost
                className={cn('size-5', {
                  'text-primary-red': isRepostedByMe,
                })}
              />
            </DropdownMenuItem>

            <QuoteButton
              quoteInfo={{
                text,
                id,
                author: author as AuthorInfoProps,
                createdAt,
                media,
                quoteId,
                linkPreview,
                mentions,
              }}
              disabled={!canInteract}
            />
          </Fragment>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThreadRepostButton;
