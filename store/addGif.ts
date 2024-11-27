import { create } from 'zustand';

interface ToggleState {
  openGifPicker: boolean;
  setOpenGifPicker: (open: boolean) => void;
  gif: string;
  setGif: (gif: string) => void;
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
}

const useAddGif = create<ToggleState>((set) => ({
  openGifPicker: false,
  setOpenGifPicker: (open) => set({ openGifPicker: open }),
  gif: '',
  setGif: (gif) => set({ gif }),
  searchTerm: '',
  setSearchTerm: (searchTerm) => set({ searchTerm }),
}));

export default useAddGif;
