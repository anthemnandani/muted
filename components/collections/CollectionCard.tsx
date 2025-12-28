'use client';

import { CollectionCardProps } from '@/lib/types';
import { getVideoThumbnailUrl } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardFooter, CardHeader } from '../ui/card';
import CollectionActions from './CollectionActions';
import DefaultCollectionCover from './DefaultCollectionCover';

const CollectionCard = ({ collection, username }: CollectionCardProps) => {
  const { user } = useUser();

  const isOwner = username === user?.username;
  const renderCover = () => {
    const firstBookmark = collection.isDefault
      ? collection.bookmarks[collection.bookmarks.length - 1]
      : collection.bookmarks[0];

    if (!firstBookmark) {
      return (
        <div className='absolute inset-0 flex-center bg-muted'>
          <DefaultCollectionCover className='object-cover transition-transform duration-300 group-hover:scale-105 text-black' />
        </div>
      );
    }

    const { media } = firstBookmark;
    const fileType = media[0]?.fileType;
    const isVideo = fileType === 'video';

    return (
      <Image
        src={
          !isVideo
            ? media[0]?.fileUrl!
            : getVideoThumbnailUrl(
                media[0].playbackId as string,
                media[0].thumbnailToken as string
              )
        }
        alt={collection.name}
        fill
        unoptimized={isVideo}
        className='object-cover transition-transform duration-300 group-hover:scale-105'
      />
    );
  };

  return (
    <Card className='group overflow-hidden'>
      <CardHeader className='p-0'>
        <Link href={`@${username}/collections/${collection.id}`}>
          <div className='relative aspect-square w-full overflow-hidden bg-muted'>
            {renderCover()}
            <div className='absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white'>
              {collection.bookmarks.length}{' '}
              {collection.bookmarks.length === 1 ? 'post' : 'posts'}
            </div>
          </div>
        </Link>
      </CardHeader>

      <CardFooter className='p-2 sm:p-3 bg-white-8'>
        <div className='flex-between w-full'>
          <div className='flex flex-col'>
            <Link href={`@${username}/collections/${collection.id}`}>
              <h3 className='font-semibold text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[180px]'>
                {collection.name}
              </h3>
            </Link>
            <span className='text-[10px] sm:text-xs text-muted-foreground'>
              {collection.privacy.toLowerCase()}
            </span>
          </div>

          {!collection.isDefault && isOwner && (
            <CollectionActions collection={collection} />
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default CollectionCard;
