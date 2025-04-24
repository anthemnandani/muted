'use client';

import { PostCardProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import useCommentPanelStore from '@/store/commentPanel';
import { useHiddenPosts } from '@/store/hiddenPosts';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import CommentsPanel from '../comments/CommentsPanel';
import PostMediaCarousel from '../posts/PostMediaCarousel';
import PostActions from '../shared/PostActions';
import HiddenPost from './HiddenPost';

const PostCard: React.FC<PostCardProps> = ({
  media,
  id,
  author,
  likes,
  text,
  createdAt,
  repliesCount,
  bookmarks,
  bookmarksCount,
  reposts,
  repostedBy,
  repostsCount,
  privacy,
  mentions,
  hideLikes,
  likesCount,
  pinned,
}) => {
  const {
    isPanelOpen,
    openPanel,
    closePanel,
    currentPostId,
    updateCurrentPost,
    isShowingPost,
  } = useCommentPanelStore();
  const { isTemporarilyHidden } = useHiddenPosts();
  const isHidden = isTemporarilyHidden(id);

  const { ref: postRef, inView } = useInView({
    threshold: 0.5,
  });

  useEffect(() => {
    if (inView && isPanelOpen) {
      updateCurrentPost(id);
    }
  }, [inView, isPanelOpen, id]);

  const toggleComments = () => {
    if (isShowingPost(id)) {
      closePanel();
      document.body.style.overflow = '';
    } else {
      openPanel(id);
      document.body.style.overflow = 'hidden';
    }
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className='h-screen flex-center relative' ref={postRef}>
      {isHidden ? (
        <HiddenPost postId={id} />
      ) : (
        <div
          className={cn(
            'flex justify-center items-end gap-4',
            'transform transition-transform duration-300 ease-in-out',
            'relative z-10',
            isPanelOpen ? 'translate-x-[-200px]' : 'translate-x-0'
          )}
        >
          <PostMediaCarousel
            media={media}
            author={author}
            createdAt={createdAt}
            postId={id!}
            text={text}
            hideLikes={hideLikes}
            pinned={pinned}
            reposts={reposts}
            repostedBy={repostedBy}
          />
          <PostActions
            id={id}
            likesCount={likesCount ?? 0}
            likes={likes}
            author={author}
            repliesCount={repliesCount ?? 0}
            repostsCount={repostsCount ?? 0}
            reposts={reposts}
            mentions={mentions}
            hideLikes={hideLikes}
            bookmarksCount={bookmarksCount ?? 0}
            bookmarks={bookmarks}
            privacy={privacy}
            onCommentsToggle={toggleComments}
          />
        </div>
      )}

      {isPanelOpen && currentPostId === id && (
        <div
          className={cn(
            'fixed top-1/2 right-20 w-[480px] h-[calc(100vh-2rem)] z-50',
            'transform -translate-y-1/2',
            'shadow-lg'
          )}
        >
          <CommentsPanel
            postId={id}
            onClose={() => {
              closePanel();
              document.body.style.overflow = '';
            }}
            authorId={author.id}
            isOpen={isPanelOpen}
            repliesCount={repliesCount ?? 0}
            createdAt={createdAt}
            text={text ?? ''}
            author={author}
            reposts={reposts}
            repostedBy={repostedBy}
          />
        </div>
      )}
    </div>
  );
};

export default PostCard;
