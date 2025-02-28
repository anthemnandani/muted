'use client';

import { CollectionData, UseCollectionProps } from '@/lib/types';
import { api } from '@/trpc/react';
import { useState } from 'react';
import { toast } from 'sonner';

export const useCollection = ({
  onSuccess,
  onClose,
}: UseCollectionProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const trpcUtils = api.useUtils();

  const { mutateAsync: createCollection } =
    api.collection.createCollection.useMutation({
      onSettled: async () => {
        await trpcUtils.collection.invalidate();
        onSuccess?.();
      },
    });

  const { mutateAsync: editCollection } =
    api.collection.editCollection.useMutation({
      onSettled: async () => {
        await trpcUtils.collection.invalidate();
        onSuccess?.();
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
      onClose?.();
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
