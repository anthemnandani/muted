import { create } from 'zustand';

type Step = 'info' | 'action';

interface SettingStoreState {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  step: Step;
  setStep: (value: Step) => void;
  otp: string;
  setOtp: (value: string) => void;
  reset: () => void;
}

const useSettingStore = create<SettingStoreState>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen: boolean) => set({ isOpen }),
  step: 'info',
  setStep: (value: Step) => set({ step: value }),
  otp: '',
  setOtp: (value: string) => set({ otp: value }),
  reset: () => set({ isOpen: false, otp: '', step: 'info' }),
}));

export default useSettingStore;
