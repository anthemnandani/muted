'use client';

import { CollectionData } from '@/store/addCollection';
import { useEffect, useRef, useState } from 'react';
import { Icons } from '../icons';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ResizeTextarea } from '../ui/resize-textarea';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';

interface CollectionFormProps {
  initialData: CollectionData;
  isEditing: boolean;
  postId?: string;
  isLoading: boolean;
  error: string;
  setOpen: (open: boolean) => void;
  onSubmit: (data: CollectionData & { postId?: string }) => Promise<any>;
  onError: (error: string) => void;
}

const CollectionForm = ({
  initialData,
  isEditing,
  postId,
  setOpen,
  isLoading,
  error,
  onSubmit,
  onError,
}: CollectionFormProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<CollectionData>(initialData);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async () => {
    try {
      await onSubmit({
        ...formData,
        postId,
      });
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  return (
    <Card className='rounded-2xl border-none bg-background shadow-2xl ring-1 ring-[#393939] ring-offset-0 dark:bg-gray-6 p-6'>
      <div className='flex items-start border-b dark:border-gray-5 border-gray-1 pb-1'>
        <button className='mr-4' onClick={() => setOpen(false)}>
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
            value={formData.name}
            onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value,
              })
            }
          />
          {error && <p className='text-red-500 text-sm'>{error}</p>}
          <Separator className='bg-border-dark dark:bg-border-light h-[0.5px]' />
        </div>

        <div className='flex flex-col w-full'>
          <Label htmlFor='description' className='text-[15px] font-semibold'>
            Description (Optional)
          </Label>
          <div className='no-scrollbar h-[215px] overflow-y-auto'>
            <ResizeTextarea
              className='w-full h-full border-none focus:outline-none'
              value={formData.description}
              maxLength={5000}
              onChange={(e) =>
                setFormData({
                  ...formData,
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
            checked={formData.privacy === 'PRIVATE'}
            onCheckedChange={(checked) =>
              setFormData({
                ...formData,
                privacy: checked ? 'PRIVATE' : 'PUBLIC',
              })
            }
          />
        </div>
        <Button
          className='w-full h-[52px] flex-center px-4 mt-4 rounded-xl bg-foreground hover:bg-foreground select-none text-white dark:text-black dark:hover:bg-slate-50 disabled:cursor-not-allowed disabled:pointer-events-auto disabled:opacity-100'
          onClick={handleSubmit}
          disabled={isLoading || formData.name.length === 0}
        >
          {isLoading ? (
            <Icons.loading className='size-8' />
          ) : (
            <span>{isEditing ? 'Edit' : 'Add'}</span>
          )}
          <span className='sr-only'>{isEditing ? 'Edit' : 'Add'}</span>
        </Button>
      </div>
    </Card>
  );
};

export default CollectionForm;
