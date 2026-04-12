'use client';

import { Icons } from '@/components/icons';
import ConfirmDialog from '@/components/modals/ConfirmDialog';
import useMediaContentData from '@/hooks/useMediaContentData';
import useMediaMutations from '@/hooks/useMediaMutations';
import { ActivityPost } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useActivityStore } from '@/store/activityStore';
import InfiniteScroll from 'react-infinite-scroll-component';
import ActionBanner from './ActionBanner';
import GridSkeleton from './GridSkeleton';
import MediaGridItem from './MediaGridItem';
import SharedHeader from './SharedHeader';
import ThreadListItem from './ThreadListItem';
import ThreadListSkeleton from './ThreadListSkeleton';

const MediaContent = () => {
  const {
    mediaTab,
    setMediaTab,
    isSelecting,
    selectedIds,
    isConfirmDialogOpen,
    setIsConfirmDialogOpen,
    setSelectedIds,
    exitSelecting,
  } = useActivityStore();

  const { items, query } = useMediaContentData();

  const { handleDelete, isDeleting } = useMediaMutations();

  const allSelected = items.length > 0 && selectedIds.size === items.length;
  const canSelect = items.length > 0 && !query.isLoading;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((item) => item.id)));
    }
  };

  const getDialogContent = () => {
    const count = selectedIds.size;
    const isPlural = count > 1;

    let noun = 'item';
    if (mediaTab === 'posts') noun = isPlural ? 'posts' : 'post';
    else if (mediaTab === 'photos') noun = isPlural ? 'photos' : 'photo';
    else if (mediaTab === 'videos') noun = isPlural ? 'videos' : 'video';
    else if (mediaTab === 'threads') noun = isPlural ? 'threads' : 'thread';

    const title =
      count === 1 ? `Delete this ${noun}` : `Delete ${count} ${noun}`;

    const description =
      count === 1
        ? `Are you sure you want to delete this ${noun}? This action cannot be undone.`
        : `Are you sure you want to delete these ${count} ${noun}? This action cannot be undone.`;

    return { title, description };
  };

  const dialogContent = getDialogContent();

  return (
    <div className='pb-24 relative'>
      <div className='flex border-b border-white/10 mb-1'>
        {(['posts', 'photos', 'videos', 'threads'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setMediaTab(t)}
            className={cn(
              'flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-all border-b-2',
              mediaTab === t
                ? 'border-white text-white'
                : 'border-transparent text-white/40 hover:text-white/60',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <SharedHeader
        allSelected={allSelected}
        canSelect={canSelect}
        handleSelectAll={handleSelectAll}
        hideContentTypeToggle
      />

      {query.isLoading ? (
        mediaTab === 'threads' ? (
          <ThreadListSkeleton />
        ) : (
          <GridSkeleton />
        )
      ) : items.length === 0 ? (
        <div className='flex-center h-40'>
          <p className='text-white/40 text-sm'>No {mediaTab} found.</p>
        </div>
      ) : (
        <InfiniteScroll
          dataLength={items.length}
          next={() => query.fetchNextPage()}
          hasMore={!!query.hasNextPage}
          loader={
            <div className='h-[80px] w-full flex-center mb-[10vh] sm:mb-0'>
              <Icons.loading className='size-11' />
            </div>
          }
        >
          {mediaTab === 'threads' ? (
            <div className='flex flex-col gap-4 px-2'>
              {items.map((thread: any) => (
                <ThreadListItem key={thread.id} thread={thread} />
              ))}
            </div>
          ) : (
            <div className='grid grid-cols-3 gap-1'>
              {items.map((item) => (
                <MediaGridItem key={item.id} item={item as ActivityPost} />
              ))}
            </div>
          )}
        </InfiniteScroll>
      )}

      {isSelecting && selectedIds.size > 0 && (
        <ActionBanner
          count={selectedIds.size}
          isProcessing={isDeleting}
          onAction={() => setIsConfirmDialogOpen(true)}
          onCancel={exitSelecting}
          actionLabel='Delete'
        />
      )}

      <ConfirmDialog
        open={isConfirmDialogOpen}
        setOpen={setIsConfirmDialogOpen}
        title={dialogContent.title}
        description={dialogContent.description}
        btnTitle='Delete'
        onClick={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default MediaContent;
