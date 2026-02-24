'use client';

import PostDetailsLayout from '@/components/shared/PostDetailsLayout';
import {
  OptimisticActionProvider,
  type TargetType,
} from '@/contexts/OptimisticActionContext';
import { QUERY_TYPE } from '@/lib/constants';
import useSinglePostStore from '@/store/singlePostStore';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

const SinglePostModal = () => {
  const { activePost, feedTarget } = useSinglePostStore();
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

  const fallbackTarget = {
    type: QUERY_TYPE.POST_DETAILS,
    variables: { id: activePost?.id },
  };

  if (!activePost) return null;

  return (
    <div className='fixed inset-0 z-[999] flex w-full h-screen max-w-full bg-[#121212]'>
      <OptimisticActionProvider
        target={(feedTarget || fallbackTarget) as TargetType}
      >
        <PostDetailsLayout post={activePost} onClose={handleClose} isModal />
      </OptimisticActionProvider>
    </div>
  );
};

export default SinglePostModal;
