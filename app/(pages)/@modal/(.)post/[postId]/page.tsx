'use client';

import CommentsPanel from '@/components/comments/CommentsPanel';
import PostMediaCarousel from '@/components/posts/PostMediaCarousel';
import useSinglePostStore from '@/store/singlePostStore';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

const SinglePostModal = () => {
  const { activePost } = useSinglePostStore();

  console.log('Active Post: ', activePost);

  const router = useRouter();

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  if (!activePost) return null;

  return (
    <div className='fixed inset-0 z-[999] flex w-full h-screen max-w-full bg-[#121212]'>
      <button
        type='button'
        aria-label='Close'
        className='post-detail-btn absolute top-4 left-4 z-[3001]'
        onClick={handleClose}
      >
        <X width={24} height={24} className='text-white stroke-[2.5px]' />
      </button>

      <div className='relative flex-[2] h-full flex-center overflow-hidden'>
        <PostMediaCarousel
          key={`media-${activePost.id}`}
          media={activePost.media}
          author={activePost.author}
          createdAt={activePost.createdAt}
          mentions={activePost.mentions}
          postId={activePost.id}
          text={activePost.text}
          pinned={activePost.pinned}
          reposts={activePost.reposts}
          hideLikes={activePost.hideLikes}
          turnOffComments={activePost.turnOffComments}
          isModal
        />
      </div>

      <div className='flex-1 h-full min-w-[350px] max-w-[500px] border-l border-zinc-800 bg-[#121212]'>
        <CommentsPanel
          key={`comments-${activePost.id}`}
          postId={activePost.id}
          onClose={handleClose}
          authorId={activePost.author.id}
          isOpen={true}
          repliesCount={activePost.repliesCount}
          createdAt={activePost.createdAt}
          text={activePost.text ?? ''}
          author={activePost.author}
          reposts={activePost.reposts}
          likesCount={activePost.likesCount ?? 0}
          repostsCount={activePost.repostsCount ?? 0}
          likes={activePost.likes}
          hideLikes={activePost.hideLikes}
          bookmarksCount={activePost.bookmarksCount ?? 0}
          bookmarks={activePost.bookmarks}
          isModal
        />
      </div>
    </div>
  );
};

export default SinglePostModal;
