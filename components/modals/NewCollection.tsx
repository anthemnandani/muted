'use client';

import { useCollection } from '@/hooks/useCollection';
import useAddCollection from '@/store/addCollection';
import CollectionForm from '../collections/CollectionForm';
import { Dialog, DialogContent } from '../ui/dialog';

const NewCollection = () => {
  const { isOpen, setIsOpen, collectionData, isEditing, postId } =
    useAddCollection();

  const { handleSubmit, isLoading, error, setError } = useCollection({
    onSuccess: () => setIsOpen(false),
    onClose: () => setIsOpen(false),
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
