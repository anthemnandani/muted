'use client';

import useSinglePostStore from '@/store/singlePostStore';
import { useEffect } from 'react';

export default function DefaultModal() {
  const setActivePost = useSinglePostStore((state) => state.setActivePost);

  useEffect(() => {
    setActivePost(null, null);
  }, [setActivePost]);

  return null;
}
