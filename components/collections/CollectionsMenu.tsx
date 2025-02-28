'use client';

import useDevice from '@/hooks/useDevice';
import { CollectionsMenuProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import useAddCollection from '@/store/addCollection';
import { Plus } from 'lucide-react';
import React from 'react';
import CollectionsList from './CollectionsList';

const CollectionsMenu = ({
  postId,
  isOpen,
  onClose,
  anchorRect,
}: CollectionsMenuProps) => {
  const menuRef = React.useRef<HTMLDivElement>(null);
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

  const getMenuPosition = () => {
    if (!anchorRect) return {};

    const MENU_WIDTH = isSmallMobile ? 175 : isMobile ? 200 : 250;
    const MENU_MARGIN = 10;

    return {
      bottom: `${window.innerHeight - anchorRect.top + MENU_MARGIN}px`,
      left: `${anchorRect.left - MENU_WIDTH / 2 + anchorRect.width / 2}px`,
    };
  };

  React.useEffect(() => {
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
        'fixed z-50 bg-black/95 border border-border-light rounded-lg shadow-lg',
        'transform -translate-y-2',
        "after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-full after:h-[10px]",
        isSmallMobile ? 'w-[175px]' : isMobile ? 'w-[200px]' : 'w-[250px]'
      )}
      style={getMenuPosition()}
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

      <CollectionsList postId={postId} />
    </div>
  );
};

export default CollectionsMenu;
