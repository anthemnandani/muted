import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { AuthorInfoProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import React from 'react';
import { toast } from 'sonner';

interface RepostButtonProps {
  id: string;
  text: string;
  author: AuthorInfoProps;
  createdAt?: Date;
  reposts: {
    userId: string;
    postId: string;
  }[];
  repostsCount: number;
}

const RepostButton: React.FC<RepostButtonProps> = ({
  id,
  text,
  author,
  createdAt,
  reposts,
  repostsCount,
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
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={isLoading}
          className='flex-center hover:bg-primary rounded-full p-2 w-fit h-fit active:scale-95 outline-none cursor-pointer'
        >
          {isRepostedByMe ? (
            <Icons.reposted className='size-5 ' />
          ) : (
            <Icons.repost className='size-5 ' />
          )}
          {repostsCount > 0 && (
            <span className='text-[13px] ml-2 text-gray-4 dark:text-gray-2'>
              {repostsCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='start'
        className='bg-background shadow-xl dark:bg-gray-6 rounded-2xl w-[190px] p-0'
      >
        <DropdownMenuItem
          disabled={isLoading}
          onClick={handleToggleRepost}
          className={cn(
            'focus:bg-transparent px-4 tracking-normal select-none font-semibold py-3 cursor-pointer text-[15px] active:bg-primary-foreground rounded-none w-full justify-between',
            {
              'text-red-600 focus:text-red-600': isRepostedByMe,
            }
          )}
        >
          {isRepostedByMe ? 'Remove' : 'Repost'}

          <Icons.repost
            className={cn('size-5', {
              'text-red-600': isRepostedByMe,
            })}
          />
        </DropdownMenuItem>
        <DropdownMenuSeparator className='h-[1.2px] my-0' />
        <div className='focus:bg-transparent px-4 tracking-normal select-none font-semibold py-3 cursor-pointer text-[15px] rounded-none active:bg-primary-foreground w-full justify-between'>
          {/* <QuoteButton
            quoteInfo={{
              text,
              id,
              author,
              createdAt,
            }}
          /> */}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default RepostButton;
