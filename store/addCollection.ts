import { CollectionPrivacy } from '@prisma/client';
import { create } from 'zustand';

export type CollectionData = {
  name: string;
  description: string;
  privacy: CollectionPrivacy;
};

interface ToggleState {
  openCollectionDialog: boolean;
  setOpenCollectionDialog: (open: boolean) => void;
  collectionData: CollectionData;
  setCollectionData: (data: CollectionData) => void;
  error: string;
  setError: (error: string) => void;
  postId: string;
  setPostId: (postId: string) => void;
  resetCollectionData: () => void;
}

const useAddCollection = create<ToggleState>((set) => ({
  openCollectionDialog: false,
  setOpenCollectionDialog: (open) =>
    set((state) => ({
      openCollectionDialog: open,
      ...(open
        ? {}
        : {
            error: '',
            collectionData: { name: '', description: '', privacy: 'PUBLIC' },
          }),
    })),
  collectionData: {
    name: '',
    description: '',
    privacy: 'PUBLIC',
  },
  setCollectionData: (data) => set({ collectionData: data }),
  error: '',
  setError: (error) => set({ error }),
  postId: '',
  setPostId: (postId) => set({ postId }),
  resetCollectionData: () =>
    set({
      collectionData: {
        name: '',
        description: '',
        privacy: 'PUBLIC',
      },
      postId: '',
    }),
}));

export default useAddCollection;
