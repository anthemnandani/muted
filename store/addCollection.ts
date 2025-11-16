import { CollectionPrivacy } from '@prisma/client';
import { create } from 'zustand';

export type CollectionData = {
  id?: string;
  name: string;
  privacy: CollectionPrivacy;
  description: string;
};

interface ToggleState {
  isOpen: boolean;
  isEditing: boolean;
  setIsOpen: (open: boolean) => void;
  collectionData: CollectionData;
  setCollectionData: (data: CollectionData) => void;
  error: string;
  setError: (error: string) => void;
  postId: string;
  setPostId: (postId: string) => void;
  resetCollectionData: () => void;
  editCollection: (collection: CollectionData) => void;
}

const useAddCollection = create<ToggleState>((set) => ({
  isOpen: false,
  isEditing: false,
  setIsOpen: (open) =>
    set((state) => ({
      isOpen: open,
      ...(open
        ? {}
        : {
            isEditing: false,
            error: '',
            collectionData: {
              id: '',
              name: '',
              description: '',
              privacy: 'PRIVATE',
            },
          }),
    })),
  collectionData: {
    id: '',
    name: '',
    description: '',
    privacy: 'PRIVATE',
  },
  setCollectionData: (data) => set({ collectionData: data }),
  error: '',
  setError: (error) => set({ error }),
  postId: '',
  setPostId: (postId) => set({ postId }),
  resetCollectionData: () =>
    set({
      isEditing: false,
      collectionData: {
        id: '',
        name: '',
        description: '',
        privacy: 'PRIVATE',
      },
      postId: '',
      error: '',
    }),
  editCollection: (collection) =>
    set({
      isEditing: true,
      isOpen: true,
      collectionData: collection,
    }),
}));

export default useAddCollection;
