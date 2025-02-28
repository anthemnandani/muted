'use client';

import { useCollection } from '@/hooks/useCollection';
import useAddCollection from '@/store/addCollection';
import { PlusCircle } from 'lucide-react';
import CollectionForm from '../collections/CollectionForm';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';

const NewCollection = ({ showTrigger }: { showTrigger?: boolean }) => {
  const { isOpen, setIsOpen, collectionData, isEditing, postId } =
    useAddCollection();

  const { handleSubmit, isLoading, error, setError } = useCollection({
    onSuccess: () => setIsOpen(false),
    onClose: () => setIsOpen(false),
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button
            variant='outline'
            size='default'
            className='
              bg-white-13 hover:bg-white/20
              text-[14px] font-medium
              px-3.5 h-8
              rounded-[999px]
              border-none
              transition-all duration-200
              flex items-center gap-1.5
            '
          >
            <PlusCircle className='size-[15.5px] stroke-[2px]' />
            New Collection
          </Button>
        </DialogTrigger>
      )}
      <DialogContent
        isSecondDialog
        className='!max-w-md select-none border-none bg-transparent shadow-none outline-none z-[1001]'
      >
        <CollectionForm
          initialData={collectionData}
          isEditing={isEditing}
          postId={postId}
          setOpen={setIsOpen}
          isLoading={isLoading}
          error={error}
          onSubmit={handleSubmit}
          onError={setError}
        />
      </DialogContent>
    </Dialog>
  );
};

export default NewCollection;
