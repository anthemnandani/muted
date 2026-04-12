'use client';

import CommentsPanel from '@/components/comments/CommentsPanel';
import PostMediaCarousel from '@/components/posts/PostMediaCarousel';
import { PostDetailsLayoutProps } from '@/lib/types';
import { X } from 'lucide-react';
import { Fragment } from 'react';
import NewCollection from '../modals/NewCollection';

const PostDetailsLayout = ({
  post,
  onClose,
  isModal = false,
  onNavigate,
  isFirstPost,
  isLastPost,
  isFetchingMore,
  source,
}: PostDetailsLayoutProps) => {
  return (
    <Fragment>
      {onClose && (
        <button
          type='button'
          aria-label='Close'
          className='post-detail-btn absolute top-4 left-4 z-[3001]'
          onClick={onClose}
        >
          <X width={24} height={24} className='text-white stroke-[2.5px]' />
        </button>
      )}

      <div className='relative flex-[2] h-full flex-center overflow-hidden'>
        <PostMediaCarousel
          key={`media-${post.id}`}
          media={post.media}
          author={post.author}
          createdAt={post.createdAt}
          mentions={post.mentions}
          postId={post.id}
          text={post.text}
          pinned={post.pinned}
          reposts={post.reposts}
          hideLikes={post.hideLikes}
          turnOffComments={post.turnOffComments}
          isModal={isModal}
          onNavigate={onNavigate}
          isFirstPost={isFirstPost}
          isLastPost={isLastPost}
          isFetchingMore={isFetchingMore}
          source={source}
        />
      </div>

      <div className='flex-1 h-full min-w-[350px] max-w-[500px] border-l border-zinc-800 bg-[#121212] overflow-y-auto'>
        <CommentsPanel
          key={`comments-${post.id}`}
          postId={post.id}
          authorId={post.author.id}
          isOpen={true}
          repliesCount={post.repliesCount}
          createdAt={post.createdAt}
          text={post.text ?? ''}
          author={post.author}
          reposts={post.reposts}
          likesCount={post.likesCount ?? 0}
          repostsCount={post.repostsCount ?? 0}
          likes={post.likes}
          hideLikes={post.hideLikes}
          bookmarksCount={post.bookmarksCount ?? 0}
          bookmarks={post.bookmarks}
          isModal={isModal}
          onClose={onClose}
        />
      </div>
      <NewCollection />
    </Fragment>
  );
};

export default PostDetailsLayout;
