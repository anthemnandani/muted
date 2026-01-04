'use client';

import useDevice from '@/hooks/useDevice';
import { CollectionsMenuProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import useAddCollection from '@/store/addCollection';
import { Plus } from 'lucide-react';
import { useEffect, useRef } from 'react';
import CollectionsList from './CollectionsList';

const CollectionsMenu = ({
  postId,
  isOpen,
  onClose,
  bookmarkInfo,
  isPanel,
}: CollectionsMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const {
    setIsOpen,
    isOpen: isAddCollectionOpen,
    setPostId,
  } = useAddCollection();
  const { isMobile, isSmallMobile } = useDevice();

  const handleNewCollection = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPostId(postId);
    setIsOpen(true);
    onClose();
  };

  useEffect(() => {
    const handleScroll = () => {
      onClose();
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [onClose]);

  if (!isOpen || isAddCollectionOpen) return null;

  return (
    <div
      ref={menuRef}
      className={cn(
        'absolute left-1/2 -translate-x-1/2 z-[3001]',
        'bg-black/95 border border-border-light rounded-lg shadow-lg',
        "after:content-[''] after:absolute after:top-full after:left-0 after:w-full after:h-[10px]",
        isSmallMobile ? 'w-[175px]' : isMobile ? 'w-[200px]' : 'w-[250px]',
        isPanel ? 'top-full mt-2' : 'bottom-full'
      )}
    >
      <div className={cn('flex-between w-full', isMobile ? 'p-2.5' : 'p-3')}>
        <h3 className='font-medium'>Collections</h3>
        <button
          aria-label='New Collection'
          className='hover:bg-accent rounded-full p-1.5 transition-colors'
          onClick={handleNewCollection}
        >
          <Plus className='size-5' />
        </button>
      </div>

      <CollectionsList bookmarkInfo={bookmarkInfo} />
    </div>
  );
};

export default CollectionsMenu;
