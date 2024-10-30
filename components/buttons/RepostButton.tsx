import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { AuthorInfoProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import React from 'react';
import { toast } from 'sonner';
import QuoteButton from './QuoteButton';

interface RepostButtonProps {
  id: string;
  text: string | null;
  author: AuthorInfoProps;
  createdAt?: Date;
  reposts: {
    userId: string;
    postId: string;
  }[];
  repostsCount: number;
  isParentPost?: boolean;
}

const RepostButton: React.FC<RepostButtonProps> = ({
  id,
  text,
  author,
  createdAt,
  reposts,
  repostsCount,
  isParentPost,
}) => {
  const { user: loggedUser } = useUser();

  const isRepostedByMe = React.useMemo(() => {
    return reposts.some((repost) => repost.userId === loggedUser?.id);
  }, [reposts, loggedUser?.id]);

  const trpcUtils = api.useUtils();

  const { mutateAsync: toggleRepost, isLoading } =
    api.post.toggleRepost.useMutation({
      onError: (error) => {
        toast.error('RepostError: Something went wrong!');
      },
      onSettled: async () => {
        await trpcUtils.invalidate();
      },
    });

  const handleToggleRepost = async () => {
    const promise = toggleRepost({ id });

    toast.promise(promise, {
      loading: (
        <div className='flex w-[270px] items-center justify-start gap-1.5 p-0'>
          <div>
            <Icons.loading className='size-8' />
          </div>
          {isRepostedByMe ? 'Removing...' : 'Reposting...'}
        </div>
      ),
      success: () => {
        return (
          <div className='flex-center p-0'>
            {isRepostedByMe ? 'Removed' : 'Reposted'}
          </div>
        );
      },
      error: 'Error',
      richColors: true,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button disabled={isLoading} className='icon-container-hover'>
          {isRepostedByMe ? (
            <Icons.reposted className='size-5' />
          ) : (
            <Icons.repost className='size-5' />
          )}
          {repostsCount > 0 && !isParentPost && (
            <span className='text-[13px] ml-2 text-gray-4 dark:text-gray-2'>
              {repostsCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='start'
        className='dropdown-content-container p-2 rounded-2xl w-[240px]'
      >
        <DropdownMenuItem
          disabled={isLoading}
          onClick={handleToggleRepost}
          className={cn('dropdown-menu-item flex-between py-3.5 px-4', {
            'text-red-600 focus:text-red-600': isRepostedByMe,
          })}
        >
          {isRepostedByMe ? 'Remove' : 'Repost'}
          <Icons.repost
            className={cn('size-5', {
              'text-red-600': isRepostedByMe,
            })}
          />
        </DropdownMenuItem>

        <QuoteButton
          quoteInfo={{
            text,
            id,
            author,
            createdAt,
          }}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default RepostButton;
