'use client';

import { Collection } from '@/lib/types';
import { cn } from '@/lib/utils';
import useAddBookmark from '@/store/addBookmark';
import { api } from '@/trpc/react';
import { Bookmark } from 'lucide-react';
import CollectionCover from './CollectionCover';

const CollectionItem = ({ collection }: { collection: Collection }) => {
  const { openBookmarkDialog: postId } = useAddBookmark();

  const isBookmarked = collection.bookmarks.some(
    (post: any) => post.id === postId
  );

  const trpcUtils = api.useUtils();

  const { mutate: toggleBookmark, isLoading } =
    api.collection.toggleBookmark.useMutation({
      onSettled: async () => {
        await trpcUtils.post.getInfinitePosts.invalidate();
        await trpcUtils.post.getNestedPosts.invalidate({
          id: postId as string,
        });
        await trpcUtils.user.postInfo.invalidate({});
        await trpcUtils.post.getSavedPosts.invalidate();
        await trpcUtils.collection.getUserCollections.invalidate();
      },
    });

  const handleToggleBookmark = () => {
    if (!postId) return;

    toggleBookmark({
      postId,
      collectionId: collection.id,
    });
  };

  return (
    <div className='flex-between'>
      <div className='flex'>
        <div>
          <div className='aspect-square relative inline-block size-14 rounded-md bg-zinc-800'>
            <CollectionCover bookmarks={collection.bookmarks} />
          </div>
        </div>
        <div className='flex w-44 flex-col justify-center pl-3 sm:w-64'>
          <h2 className='overflow-hidden text-ellipsis whitespace-nowrap text-xs font-semibold leading-4'>
            {collection.name}
          </h2>
          <p className='text-sm text-zinc-500'>{collection.postsCount} posts</p>
        </div>
      </div>
      <button
        type='button'
        disabled={isLoading}
        onClick={handleToggleBookmark}
        className='icon-container-hover'
      >
        <Bookmark
          fill={isBookmarked ? 'currentColor' : 'transparent'}
          className={cn(
            'size-5 transition-colors',
            isLoading && 'opacity-50',
            isBookmarked && 'text-primary-blue'
          )}
        />
      </button>
    </div>
  );
};

export default CollectionItem;
