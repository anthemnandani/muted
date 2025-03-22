'use client';

import { PostCardProps } from '@/lib/types';
import { useState, useEffect } from 'react';
import PostMediaCarousel from '../posts/PostMediaCarousel';
import PostActions from '../shared/PostActions';
import CommentsPanel from '../comments/CommentsPanel';

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
  linkPreview,
  hideLikes,
  likesCount,
  pinned,
  index,
  totalPosts,
}) => {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  // Function to toggle comments panel
  const toggleComments = () => {
    setIsCommentsOpen(!isCommentsOpen);

    // Add body lock to prevent scrolling when comments are open
    if (isCommentsOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  return (
    <div className='h-screen flex-center relative'>
      {/* Main post content */}
      <div
        className='flex justify-center items-end gap-4'
        style={{
          transform: isCommentsOpen ? 'translateX(-200px)' : 'translateX(0)',
          transition: 'transform 0.5s ease',
          position: 'relative',
          zIndex: 10,
        }}
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
          text={text}
          author={author}
          createdAt={createdAt}
          repliesCount={repliesCount ?? 0}
          repostsCount={repostsCount ?? 0}
          reposts={reposts}
          media={media}
          linkPreview={linkPreview}
          mentions={mentions}
          hideLikes={hideLikes}
          bookmarksCount={bookmarksCount ?? 0}
          bookmarks={bookmarks}
          privacy={privacy}
          onCommentsToggle={toggleComments}
          isCommentsOpen={isCommentsOpen}
        />
      </div>

      {/* Comments panel - simple fixed position */}
      {isCommentsOpen && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            right: '50px',
            width: '480px',
            height: 'calc(100vh - 2rem)',
            maxHeight: '100vh',
            backgroundColor: '#000',
            zIndex: 50,
            transform: `translate(${isCommentsOpen ? '0' : '100%'}, -50%)`,
            transition: 'transform 0.25s ease-in-out',
            boxShadow: isCommentsOpen
              ? '-2px 0 10px rgba(0, 0, 0, 0.5)'
              : 'none',
            visibility: isCommentsOpen ? 'visible' : 'hidden',
            opacity: isCommentsOpen ? 1 : 0,
            borderRadius: '8px',
          }}
        >
          <CommentsPanel
            postId={id!}
            isOpen={isCommentsOpen}
            onClose={toggleComments}
          />
        </div>
      )}
    </div>
  );
};

export default PostCard;
