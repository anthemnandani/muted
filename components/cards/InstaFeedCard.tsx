'use client';

import type { ParentPostProps, ViewContentTypeValue } from '@/lib/types';
import { formatCount, formatTimeAgo } from '@/lib/utils';
import useBreakpoint from '@/hooks/useBreakpoint';
import { useViewTracker } from '@/hooks/useViewTracking';
import { useHiddenPosts } from '@/store/hiddenPosts';
import { useMutedUsers } from '@/store/mutedUsers';
import useSinglePostStore from '@/store/singlePostStore';
import { useUser } from '@clerk/nextjs';
import { Eye, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import BookmarkButton from '../buttons/BookmarkButton';
import LikeButton from '../buttons/LikeButton';
import PostActionMenu from '../menus/PostActionMenu';
import SharePost from '../modals/SharePost';
import CommentsPanel from '../comments/CommentsPanel';
import PostText from '../shared/PostText';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import BottomSheet from '../ui/bottom-sheet';
import Username from '../user/Username';
import InstagramMediaDisplay from './InstagramMediaDisplay';
import { useOptimisticAction } from '@/contexts/OptimisticActionContext';

const InstaFeedCard: React.FC<ParentPostProps> = ({
  id,
  author,
  createdAt,
  text,
  media,
  mentions,
  likes,
  likesCount = 0,
  repliesCount = 0,
  bookmarks,
  bookmarksCount = 0,
  hideLikes,
  turnOffComments,
  reposts,
  privacy,
  path,
  pinned,
  viewCount = 0,
  source = 'MAIN_FEED',
}) => {
  const { isPostHidden } = useHiddenPosts();
  const { isMutedUser } = useMutedUsers();
  const { isMobile: isMobileView, isSmallMobile } = useBreakpoint();
  const isMobile = isMobileView || isSmallMobile;
  const [commentsOpen, setCommentsOpen] = useState(false);

  const { setActivePost } = useSinglePostStore();
  const { target } = useOptimisticAction();
  const { user } = useUser();

  // Determine content type for view tracking
  const contentType: ViewContentTypeValue = media?.[0]?.fileType === 'GIF'
    ? 'GIF'
    : media?.[0]?.fileType === 'VIDEO'
      ? 'VIDEO'
      : media?.[0]?.fileType === 'IMAGE'
        ? 'IMAGE'
        : 'TEXT';

  const { ref: viewRef } = useViewTracker({
    postId: id,
    contentType,
    source,
    authorId: author.id,
    currentUserId: user?.id || '',
  });

  const isHidden = isPostHidden(id);
  const isMuted = isMutedUser(author.id);

  if (!media?.length && !text) return null;

  return (
    <article ref={viewRef} className='border-b border-border-light'>
      {!isHidden && !isMuted && (
        <div className='flex items-center justify-between px-3 py-2.5'>
          <div className='flex items-center gap-2.5'>
            <Link href={`/@${author.username}`}>
              <Avatar className='size-8 rounded-full'>
                <AvatarImage
                  src={author.image ?? ''}
                  alt={author.username ?? ''}
                  className='object-cover'
                />
                <AvatarFallback className='text-xs'>
                  {author.username?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className='flex items-center gap-1.5'>
              <Username author={author} />
              <span className='text-white/40 text-xs'>•</span>
              <span className='text-white/40 text-xs'>
                {formatTimeAgo(createdAt)}
              </span>
            </div>
          </div>
          <PostActionMenu
            author={author}
            postId={id}
            createdAt={createdAt}
            caption={text ?? ''}
            hideLikes={hideLikes ?? false}
            pinned={pinned ?? false}
            showControls
            turnOffComments={turnOffComments ?? false}
          />
        </div>
      )}
      {media && media.length > 0 && (
        <InstagramMediaDisplay
          media={media}
          postId={id}
          text={text}
          username={author.username}
          userId={author.id}
          isHidden={isHidden}
          isMuted={isMuted}
        />
      )}
      {!isHidden && !isMuted && (
        <div className='px-3 mt-3'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-4'>
              <LikeButton
                likeInfo={{
                  id,
                  likesCount,
                  likes,
                }}
                hideLikes={hideLikes}
                authorId={author?.id}
                isMainFeed
              />

              {isMobile ? (
                <button
                  type='button'
                  aria-label='Comment'
                  className='hover:scale-110 transition-transform flex items-center'
                  onClick={() => setCommentsOpen(true)}
                  disabled={turnOffComments}
                >
                  <MessageCircle
                    className='size-[26px] text-white -rotate-90'
                    strokeWidth={2}
                  />
                  {repliesCount > 0 && (
                    <strong className='text-[13px] font-semibold leading-4 text-center text-white/90 ml-1.5'>
                      {formatCount(repliesCount)}
                    </strong>
                  )}
                </button>
              ) : (
                <Link
                  href={`/post/${id}`}
                  aria-label='Comment'
                  className='hover:scale-110 transition-transform flex items-center'
                  onClick={() => {
                    setActivePost(
                      {
                        id,
                        author,
                        createdAt,
                        text,
                        media,
                        mentions,
                        likes,
                        likesCount,
                        repliesCount,
                        bookmarks,
                        reposts,
                        privacy,
                        path,
                        bookmarksCount,
                        hideLikes,
                        turnOffComments,
                        pinned,
                      },
                      target,
                    );
                  }}
                  scroll={false}
                >
                  <MessageCircle
                    className='size-[26px] text-white -rotate-90'
                    strokeWidth={2}
                  />
                  {repliesCount > 0 && (
                    <strong className='text-[13px] font-semibold leading-4 text-center text-white/90 ml-1.5'>
                      {formatCount(repliesCount)}
                    </strong>
                  )}
                </Link>
              )}

              <SharePost id={id} authorId={author.id} isMainFeed />
            </div>

            <div className='flex items-center gap-3'>
              {viewCount > 0 && (
                <div className='flex items-center gap-1 text-zinc-500'>
                  <Eye className='size-4' />
                  <span className='text-sm'>
                    {formatCount(viewCount)}
                  </span>
                </div>
              )}
              <BookmarkButton
                bookmarkInfo={{
                  id,
                  bookmarksCount,
                  bookmarks,
                }}
                isMainFeed
              />
            </div>
          </div>

          {text && (
            <div className='mb-2.5'>
              <Username author={author} />
              <PostText text={text} mentions={mentions} className='ml-1' />
            </div>
          )}
        </div>
      )}
      {isMobile && (
        <BottomSheet open={commentsOpen} onOpenChange={setCommentsOpen}>
          <div className='flex-1 min-h-0'>
            <CommentsPanel
              key={`comments-${id}`}
              postId={id}
              onClose={() => setCommentsOpen(false)}
              authorId={author.id}
              isOpen={commentsOpen}
              repliesCount={repliesCount ?? 0}
              createdAt={createdAt}
              text={text ?? ''}
              author={author}
              reposts={reposts}
            />
          </div>
        </BottomSheet>
      )}
    </article>
  );
};

export default InstaFeedCard;