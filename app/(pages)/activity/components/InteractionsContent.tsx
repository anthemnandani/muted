'use client';

import { Icons } from '@/components/icons';
import ConfirmDialog from '@/components/modals/ConfirmDialog';
import useInteractionsData from '@/hooks/useInteractionsData';
import useInteractionsMutations from '@/hooks/useInteractionsMutations';
import { INTERACTIONS_DATA } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useActivityStore } from '@/store/activityStore';
import InfiniteScroll from 'react-infinite-scroll-component';
import ActionBanner from './ActionBanner';
import EmptyState from './EmptyState';
import GridSkeleton from './GridSkeleton';
import InteractionsList from './InteractionsList';
import ListSkeleton from './ListSkeleton';
import SharedHeader from './SharedHeader';
import ThreadListSkeleton from './ThreadListSkeleton';

const getDialogContent = (tab: string, contentType: string, count: number) => {
  const isPlural = count > 1;
  let action = 'Delete';
  let noun = 'item';

  if (tab === 'likes') {
    action = 'Unlike';
    noun =
      contentType === 'posts'
        ? isPlural
          ? 'posts'
          : 'post'
        : isPlural
          ? 'threads'
          : 'thread';
  } else if (tab === 'comments') {
    action = 'Delete';
    noun =
      contentType === 'posts'
        ? isPlural
          ? 'comments'
          : 'comment'
        : isPlural
          ? 'replies'
          : 'reply';
  } else if (tab === 'reposts') {
    action = 'Remove';
    noun = isPlural ? 'reposts' : 'repost';
  }

  const title =
    count === 1 ? `${action} this ${noun}` : `${action} ${count} ${noun}`;
  const description =
    count === 1
      ? `Are you sure you want to ${action.toLowerCase()} this ${noun}? ${tab !== 'likes' ? 'This action cannot be undone.' : ''}`
      : `Are you sure you want to ${action.toLowerCase()} these ${count} ${noun}? ${tab !== 'likes' ? 'This action cannot be undone.' : ''}`;

  return { title, description, btnTitle: action };
};

const getEmptyMessage = (tab: string, contentType: string) => {
  if (tab === 'comments')
    return contentType === 'posts'
      ? 'No comments on posts yet'
      : 'No replies to threads yet';
  if (tab === 'reposts') return `No reposted ${contentType} yet`;
  return `No liked ${contentType} yet`;
};

const InteractionsContent = () => {
  const {
    tab,
    contentType,
    isSelecting,
    selectedIds,
    isConfirmDialogOpen,
    setTab,
    exitSelecting,
    setSelectedIds,
    setIsConfirmDialogOpen,
  } = useActivityStore();

  const { items, query, type } = useInteractionsData();
  const { handleDelete, isDeleting } = useInteractionsMutations();

  const allSelected = items.length > 0 && selectedIds.size === items.length;
  const canSelect = items.length > 0 && !query.isLoading;
  const dialogContent = getDialogContent(tab, contentType, selectedIds.size);

  const handleSelectAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(items.map((item: any) => item.id)));
  };

  const renderSkeletons = () => {
    if (
      type === INTERACTIONS_DATA.POST_COMMENTS ||
      type === INTERACTIONS_DATA.THREAD_COMMENTS
    )
      return <ListSkeleton />;
    if (type === INTERACTIONS_DATA.THREAD_LIST) return <ThreadListSkeleton />;
    return <GridSkeleton />;
  };

  return (
    <div className='pb-24 relative'>
      <div className='flex border-b border-white/10'>
        {(['likes', 'comments', 'reposts'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-all border-b-2',
              tab === t
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
      />

      {query.isLoading ? (
        renderSkeletons()
      ) : items.length === 0 ? (
        <EmptyState message={getEmptyMessage(tab, contentType)} />
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
          <InteractionsList type={type} items={items} />
        </InfiniteScroll>
      )}

      {isSelecting && selectedIds.size > 0 && (
        <ActionBanner
          count={selectedIds.size}
          isProcessing={isDeleting}
          onAction={() => setIsConfirmDialogOpen(true)}
          onCancel={exitSelecting}
          actionLabel={
            tab === 'likes' ? 'Unlike' : tab === 'reposts' ? 'Remove' : 'Delete'
          }
        />
      )}

      <ConfirmDialog
        open={isConfirmDialogOpen}
        setOpen={setIsConfirmDialogOpen}
        title={dialogContent.title}
        description={dialogContent.description}
        btnTitle={dialogContent.btnTitle}
        onClick={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default InteractionsContent;
