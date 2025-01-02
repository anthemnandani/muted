'use client';

import useAddCollection from '@/store/addCollection';
import { api } from '@/trpc/react';
import React from 'react';
import { toast } from 'sonner';
import { Icons } from '../icons';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
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
  } = useAddCollection();
  const trpcUtils = api.useContext();

  const { mutateAsync: createCollection, isLoading } =
    api.collection.createCollection.useMutation({
      onMutate: () => {
        setError('');
      },
      onSuccess: (result) => {
        if (!result.success) {
          setError(result.warning as string);
          return;
        }
        toast.success('Collection added successfully');
        setError('');
        setCollectionData({ name: '', privacy: 'PUBLIC' });
        setOpenCollectionDialog(false);
      },
      onSettled: async () => {
        await trpcUtils.collection.getUserCollections.invalidate();
      },
      retry: false,
    });

  const handleCreateCollection = async () => {
    await createCollection(collectionData);
  };

  React.useEffect(() => {
    if (openCollectionDialog) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      setError('');
      setCollectionData({ name: '', privacy: 'PUBLIC' });
    }
  }, [openCollectionDialog]);

  return (
    <Dialog open={openCollectionDialog} onOpenChange={setOpenCollectionDialog}>
      <DialogTrigger className='w-full'>
        <button className='flex rounded-3xl border border-zinc-600 bg-black py-2 px-4 text-sm text-white hover:bg-zinc-800 focus:outline-none focus:ring focus:ring-blue-600'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth='1.5'
            stroke='currentColor'
            aria-hidden='true'
            className='mt-0.5 mr-1 h-4 w-4'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M12 4.5v15m7.5-7.5h-15'
            ></path>
          </svg>
          <span className='mr-1'>New Collection</span>
        </button>
      </DialogTrigger>
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
              New Collection
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
              disabled={isLoading || collectionData.name.length === 0}
            >
              {isLoading ? (
                <Icons.loading className='size-8' />
              ) : (
                <span>Add</span>
              )}
              <span className='sr-only'>Add</span>
            </Button>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default NewCollection;
