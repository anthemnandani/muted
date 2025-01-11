'use client';

import NotFound from '@/app/not-found';
import CollectionCard from '@/components/collections/CollectionCard';
import Loader from '@/components/shared/Loader';
import { api } from '@/trpc/react';

const BookmarksClient = ({ username }: { username: string }) => {
  const {
    data: collections,
    isLoading,
    isError,
  } = api.collection.getUserCollections.useQuery({
    username,
    sortBy: 'oldest',
  });

  if (isLoading) return <Loader />;

  if (isError) return <NotFound />;

  return (
    <div className='px-2 sm:px-4 pt-4 pb-20 md:pb-10'>
      <div className='grid grid-cols-3 gap-2 sm:gap-3 md:gap-4'>
        {collections.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
      </div>
      {collections.length === 0 && (
        <div className='h-[50vh] w-full flex-center text-gray-3'>
          <p>No collections found</p>
        </div>
      )}
    </div>
  );
};

export default BookmarksClient;
