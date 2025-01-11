'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Collection } from '@/lib/types';
import useAddCollection from '@/store/addCollection';
import { MoreVertical, Pencil } from 'lucide-react';
import MenuItem from '../shared/MenuItem';
import DeleteCollection from './DeleteCollection';

const CollectionActions = ({ collection }: { collection: Collection }) => {
  const { id, name, description, privacy } = collection;

  const { editCollection } = useAddCollection();

  const handleEdit = () => {
    editCollection({
      id,
      name,
      privacy,
      description: description || '',
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className='flex-center relative hover:before:content-[""] hover:before:absolute hover:before:bg-primary hover:before:z-[2] hover:before:-inset-2 hover:before:rounded-full cursor-pointer'>
          <MoreVertical className='aspect-square object-cover object-center size-4 overflow-hidden flex-1 text-secondary' />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        className='dropdown-content-container rounded-xl p-0 w-40 sm:w-44'
      >
        <MenuItem
          icon={Pencil}
          label='Edit'
          className='flex-between py-2 px-4'
          onClick={handleEdit}
          isActionMenuItem
        />
        <DropdownMenuSeparator />
        <DeleteCollection collectionId={id} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CollectionActions;
