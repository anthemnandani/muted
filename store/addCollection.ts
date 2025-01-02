import { CollectionPrivacy } from '@prisma/client';
import { create } from 'zustand';

interface ToggleState {
  openCollectionDialog: boolean;
  setOpenCollectionDialog: (open: boolean) => void;
  collectionData: {
    name: string;
    privacy: CollectionPrivacy;
  };
  setCollectionData: (data: {
    name: string;
    privacy: CollectionPrivacy;
  }) => void;
  error: string;
  setError: (error: string) => void;
}

const useAddCollection = create<ToggleState>((set) => ({
  openCollectionDialog: false,
  setOpenCollectionDialog: (open) => set({ openCollectionDialog: open }),
  collectionData: {
    name: '',
    privacy: 'PUBLIC',
  },
  setCollectionData: (data) => set({ collectionData: data }),
  error: '',
  setError: (error) => set({ error }),
}));

export default useAddCollection;
