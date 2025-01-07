'use client';

import useDevice from '@/hooks/useDevice';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';
import { toast } from 'sonner';
import { Icons } from '../icons';
import { ScrollArea } from '../ui/scroll-area';
import CollectionCover from './CollectionCover';

const CollectionsList = ({ postId }: { postId: string }) => {
  const { isMobile } = useDevice();
  const utils = api.useContext();
  const { data: collections, isLoading } =
    api.collection.getUserCollections.useQuery(undefined, {
      select: (data) => data.filter((c) => !c.isDefault),
    });

  const { mutateAsync: toggleBookmark } =
    api.collection.toggleBookmark.useMutation({
      onSettled: async () => {
        await utils.collection.getUserCollections.invalidate();
        await utils.post.getInfinitePosts.invalidate();
        await utils.post.getNestedPosts.invalidate({ id: postId });
      },
      retry: false,
    });

  if (isLoading)
    return (
      <div className='flex-center h-20'>
        <Icons.loading className='size-11' />
      </div>
    );

  if (!collections)
    return <div className='flex-center h-20'>No collections found</div>;

  const handleCollectionClick = async (collectionId: string) => {
    try {
      await toggleBookmark({ postId, collectionId });
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  return (
    <ScrollArea
      className={cn(
        'max-h-[200px] overflow-y-auto flex flex-col',
        isMobile ? 'p-2.5' : 'p-3'
      )}
      type='always'
    >
      {collections?.map((collection) => (
        <CollectionCover
          key={collection.id}
          collection={collection}
          postId={postId}
          onClick={() => handleCollectionClick(collection.id)}
        />
      ))}
    </ScrollArea>
  );
};

export default CollectionsList;
