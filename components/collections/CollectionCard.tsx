'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Collection } from '@/lib/types';
import { isImage, isVideo } from '@/lib/utils';
import { api } from '@/trpc/react';
import { MoreHorizontal } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardFooter, CardHeader } from '../ui/card';
import DefaultCollectionCover from './DefaultCollectionCover';
import TextPostCover from './TextPostCover';

interface CollectionCardProps {
  collection: Collection;
}

const CollectionCard = ({ collection }: CollectionCardProps) => {
  const router = useRouter();
  const utils = api.useUtils();

  const { mutate: deleteCollection } =
    api.collection.deleteCollection.useMutation({
      onSuccess: () => {
        utils.collection.getUserCollections.invalidate();
        toast.success('Collection deleted');
      },
      onError: () => toast.error('Failed to delete collection'),
    });

  const handleEdit = () => {
    router.push(`/collections/${collection.id}/edit`);
  };

  const handleDelete = () => {
    deleteCollection({ id: collection.id });
  };

  const renderCover = () => {
    const firstBookmark = collection.bookmarks[0];

    if (!firstBookmark) {
      return (
        <div className='absolute inset-0 flex-center bg-muted'>
          <DefaultCollectionCover className='object-cover transition-transform duration-300 group-hover:scale-105 text-black' />
        </div>
      );
    }

    const { media, author, text } = firstBookmark;
    const fileType = media?.fileType;

    if (isImage(fileType as string)) {
      return (
        <Image
          src={media?.fileUrl as string}
          alt={collection.name}
          fill
          className='object-cover transition-transform duration-300 group-hover:scale-105'
        />
      );
    }

    if (isVideo(fileType as string)) {
      return (
        <video
          src={media?.fileUrl as string}
          className='absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
          muted
        />
      );
    }

    return (
      <TextPostCover
        author={{
          image: author.image!,
          fullName: author.fullName!,
          username: author.username,
        }}
        content={text!}
      />
    );
  };

  return (
    <Card className='group overflow-hidden'>
      <CardHeader className='p-0'>
        <Link href={`/bookmarks/${collection.id}`}>
          <div className='relative aspect-square w-full overflow-hidden bg-muted'>
            {renderCover()}
            <div className='absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white'>
              {collection.bookmarks.length}{' '}
              {collection.bookmarks.length === 1 ? 'post' : 'posts'}
            </div>
          </div>
        </Link>
      </CardHeader>

      <CardFooter className='p-2 sm:p-3'>
        <div className='flex-between w-full'>
          <div className='flex flex-col'>
            <Link href={`/bookmarks/${collection.id}`}>
              <h3 className='font-semibold text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[180px]'>
                {collection.name}
              </h3>
            </Link>
            <span className='text-[10px] sm:text-xs text-muted-foreground'>
              {collection.privacy.toLowerCase()}
            </span>
          </div>

          {!collection.isDefault && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className='hover:bg-accent rounded-full p-0.5 sm:p-1'>
                  <MoreHorizontal className='h-3 w-3 sm:h-4 sm:w-4' />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-28 sm:w-32'>
                <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className='text-destructive focus:text-destructive'
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default CollectionCard;
