'use client';

import { CollectionData } from '@/lib/types';
import useAddCollection from '@/store/addCollection';
import { api } from '@/trpc/react';
import { useState } from 'react';
import { toast } from 'sonner';

export const useCollection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const trpcUtils = api.useUtils();
  const { resetCollectionData, setIsOpen } = useAddCollection();

  const { mutateAsync: createCollection } =
    api.collection.createCollection.useMutation({
      onMutate: () => {
        resetCollectionData();
      },
      onSettled: () => {
        trpcUtils.collection.getUserCollections.invalidate();
      },
    });

  const { mutateAsync: editCollection } =
    api.collection.editCollection.useMutation({
      onSettled: () => {
        trpcUtils.collection.getUserCollections.invalidate();
        setIsOpen(false);
      },
    });

  const handleSubmit = async (data: CollectionData & { postId?: string }) => {
    try {
      setIsLoading(true);
      setError('');

      if (data.id) {
        await editCollection({
          id: data.id,
          name: data.name,
          description: data.description,
          privacy: data.privacy,
        });
      } else {
        // if (!data.postId) return toast.error('Post ID is required');
        await createCollection({
          name: data.name,
          description: data.description,
          privacy: data.privacy,
          postId: data.postId,
        });
      }
      toast.success('Success');
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      toast.error('Failed to save collection');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleSubmit,
    isLoading,
    error,
    setError,
  };
};
