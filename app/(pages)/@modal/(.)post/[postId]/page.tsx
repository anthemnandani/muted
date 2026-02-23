'use client';

import PostDetailsLayout from '@/components/shared/PostDetailsLayout';
import useSinglePostStore from '@/store/singlePostStore';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

const SinglePostModal = () => {
  const { activePost } = useSinglePostStore();
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
      <PostDetailsLayout post={activePost} onClose={handleClose} isModal />
    </div>
  );
};

export default SinglePostModal;
