import { api } from '@/trpc/react';
import { Bookmark } from 'lucide-react';
import CollectionItem from './CollectionItem';
import Loading from '@/app/(pages)/loading';
import { Icons } from '../icons';

const CollectionsList = () => {
  const { data: collections, isLoading } =
    api.collection.getUserCollections.useQuery();

  if (isLoading)
    return (
      <div className='flex-center h-20'>
        <Icons.loading className='size-11' />
      </div>
    );

  if (!collections)
    return <div className='flex-center h-20'>No collections found</div>;

  return (
    <div className='max-h-[385px] overflow-y-auto pb-6'>
      <div className='flex flex-col gap-3 px-6'>
        {collections?.map((collection) => (
          <CollectionItem key={collection.id} collection={collection} />
        ))}
      </div>
    </div>
  );
};

export default CollectionsList;
