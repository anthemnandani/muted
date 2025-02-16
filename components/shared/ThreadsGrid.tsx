'use client';

import Loading from '@/app/(pages)/loading';
import type { ParentPostProps, PostsListProps } from '@/lib/types';
import { isGif, isImage, isVideo } from '@/lib/utils';
import { Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import InfiniteScroll from 'react-infinite-scroll-component';
import TextPostCover from '../collections/TextPostCover';
import { Icons } from '../icons';

const ThreadsGrid = ({
  isLoading,
  posts,
  fetchNextPage,
  hasNextPage,
}: PostsListProps) => {
  const renderPostContent = (post: ParentPostProps) => {
    if (post.media) {
      if (isVideo(post.media[0].fileType)) {
        return (
          <div className='absolute inset-0 flex-center'>
            <video
              src={post.media[0].fileUrl as string}
              className='absolute w-full h-full object-cover'
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
            <div className='absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors' />
            <Play className='size-6 text-white z-10' />
          </div>
        );
      }
      if (isImage(post.media[0].fileType) || isGif(post.media[0].fileType)) {
        return (
          <Image
            src={post.media[0].fileUrl as string}
            alt={post.text || ''}
            fill
            className='object-cover transition-transform group-hover:scale-105'
          />
        );
      }
    }
    return <TextPostCover author={post.author} content={post.text || ''} />;
  };
  return (
    <>
      {!isLoading && posts?.length === 0 && (
        <div className='h-[50vh] w-full flex-center text-gray-3'>
          <p>No media posts found.</p>
        </div>
      )}
      {isLoading ? (
        <Loading className='md:!h-[80vh]' />
      ) : (
        <InfiniteScroll
          dataLength={posts?.length ?? 0}
          next={fetchNextPage}
          hasMore={hasNextPage ?? false}
          loader={
            <div className='h-[80px] w-full flex-center mb-[10vh] sm:mb-0'>
              <Icons.loading className='size-11' />
            </div>
          }
        >
          <div className='grid grid-cols-3 pb-20 md:pb-0'>
            {posts?.map((post) => (
              <Link
                key={post.id}
                href={`/${post.author.username}/post/${post.id}`}
                className='aspect-square relative group overflow-hidden border border-gray-1 dark:border-gray-5'
              >
                {renderPostContent(post)}
              </Link>
            ))}
          </div>
        </InfiniteScroll>
      )}
    </>
  );
};

export default ThreadsGrid;
