import { CollectionPrivacy } from '@prisma/client';
import { create } from 'zustand';

export type CollectionData = {
  id?: string;
  name: string;
  privacy: CollectionPrivacy;
  description: string;
};

interface ToggleState {
  openCollectionDialog: boolean;
  isEditing: boolean;
  setOpenCollectionDialog: (open: boolean) => void;
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
  openCollectionDialog: false,
  isEditing: false,
  setOpenCollectionDialog: (open) =>
    set((state) => ({
      openCollectionDialog: open,
      ...(open
        ? {
            isEditing: state.isEditing,
            collectionData: state.collectionData,
          }
        : {
            isEditing: false,
            error: '',
            collectionData: {
              id: '',
              name: '',
              description: '',
              privacy: 'PUBLIC',
            },
          }),
    })),
  collectionData: {
    id: '',
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
      isEditing: false,
      collectionData: {
        id: '',
        name: '',
        description: '',
        privacy: 'PUBLIC',
      },
      postId: '',
    }),
  editCollection: (collection) =>
    set({
      isEditing: true,
      openCollectionDialog: true,
      collectionData: collection,
    }),
}));

export default useAddCollection;
