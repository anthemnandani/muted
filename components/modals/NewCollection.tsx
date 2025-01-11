'use client';

import useAddCollection from '@/store/addCollection';
import { api } from '@/trpc/react';
import React from 'react';
import { toast } from 'sonner';
import { Icons } from '../icons';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Dialog, DialogContent } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ResizeTextarea } from '../ui/resize-textarea';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';

const NewCollection = () => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const {
    openCollectionDialog,
    setOpenCollectionDialog,
    collectionData,
    setCollectionData,
    error,
    setError,
    postId,
    isEditing,
    resetCollectionData,
  } = useAddCollection();
  const trpcUtils = api.useContext();

  const { mutateAsync: createCollection, isLoading } =
    api.collection.createCollection.useMutation({
      onMutate: () => {
        setError('');
      },
      onSuccess: (result) => {
        if (!result.success) {
          setError(result.warning || 'Something went wrong');
          return;
        }
        toast.success('Collection added successfully');
        setError('');
        resetCollectionData();
        setOpenCollectionDialog(false);
      },
      onSettled: async () => {
        await trpcUtils.invalidate();
      },
      retry: false,
    });

  const { mutateAsync: editCollection, isLoading: isEditingLoading } =
    api.collection.editCollection.useMutation({
      onMutate: () => {
        setError('');
      },
      onSuccess: (result) => {
        if (!result.success) {
          setError('Something went wrong');
          return;
        }
        toast.success('Success');
        setError('');
        setOpenCollectionDialog(false);
      },
      onSettled: async () => {
        await trpcUtils.invalidate();
      },
      retry: false,
    });

  const handleCreateCollection = async () => {
    if (isEditing) {
      await editCollection({
        id: collectionData.id!,
        ...collectionData,
      });
    } else {
      await createCollection({
        postId,
        ...collectionData,
      });
    }
  };

  React.useEffect(() => {
    if (openCollectionDialog) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [openCollectionDialog]);

  return (
    <Dialog open={openCollectionDialog} onOpenChange={setOpenCollectionDialog}>
      <DialogContent
        isSecondDialog
        className='!max-w-md select-none border-none bg-transparent shadow-none outline-none z-[1001]'
      >
        <Card className='rounded-2xl border-none bg-background shadow-2xl ring-1 ring-[#393939] ring-offset-0 dark:bg-gray-6 p-6'>
          <div className='flex items-start border-b dark:border-gray-5 border-gray-1 pb-1'>
            <button
              className='mr-4'
              onClick={() => setOpenCollectionDialog(false)}
            >
              <Icons.close className='size-6 hover:cursor-pointer' />
            </button>
            <h2 className='pb-2 text-xl font-medium leading-6'>
              {isEditing ? 'Edit Collection' : 'New Collection'}
            </h2>
          </div>
          <div className='pt-4 flex flex-col gap-4'>
            <div className='flex flex-col w-full'>
              <Label htmlFor='name' className='text-[15px] font-semibold'>
                Name
              </Label>
              <Input
                className='w-full h-8 px-0 border-none focus-visible:!ring-0 focus-visible:!ring-offset-0 focus-visible:outline-none focus-visible:ring-transparent bg-transparent'
                maxLength={100}
                ref={inputRef}
                value={collectionData.name}
                onChange={(e) =>
                  setCollectionData({
                    ...collectionData,
                    name: e.target.value,
                  })
                }
              />
              {error && <p className='text-red-500 text-sm'>{error}</p>}
              <Separator className='bg-border-dark dark:bg-border-light h-[0.5px]' />
            </div>

            <div className='flex flex-col w-full'>
              <Label
                htmlFor='description'
                className='text-[15px] font-semibold'
              >
                Description (Optional)
              </Label>
              <div className='no-scrollbar h-[215px] overflow-y-auto'>
                <ResizeTextarea
                  className='w-full h-full border-none focus:outline-none'
                  value={collectionData.description || ''}
                  maxLength={5000}
                  onChange={(e) =>
                    setCollectionData({
                      ...collectionData,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <Separator className='bg-border-dark dark:bg-border-light h-[0.5px]' />
            </div>

            <div className='flex-between w-full'>
              <Label
                htmlFor='collectionPrivacy'
                className='text-[15px] font-semibold'
              >
                Private Collection
              </Label>
              <Switch
                id='collectionPrivacy'
                checked={collectionData.privacy === 'PRIVATE'}
                onCheckedChange={(checked) =>
                  setCollectionData({
                    ...collectionData,
                    privacy: checked ? 'PRIVATE' : 'PUBLIC',
                  })
                }
              />
            </div>
            <Button
              className='w-full h-[52px] flex-center px-4 mt-4 rounded-xl bg-foreground hover:bg-foreground select-none text-white dark:text-black dark:hover:bg-slate-50 disabled:cursor-not-allowed disabled:pointer-events-auto disabled:opacity-100'
              onClick={handleCreateCollection}
              disabled={
                isLoading ||
                isEditingLoading ||
                collectionData.name.length === 0
              }
            >
              {isLoading || isEditingLoading ? (
                <Icons.loading className='size-8' />
              ) : (
                <span>{isEditing ? 'Edit' : 'Add'}</span>
              )}
              <span className='sr-only'>{isEditing ? 'Edit' : 'Add'}</span>
            </Button>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default NewCollection;
