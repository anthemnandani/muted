import { Privacy } from '@prisma/client';
import { create } from 'zustand';

interface ToggleState {
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
  fullName: string;
  username: string;
  profilePic: string;
  setProfilePic: (profilePic: string) => void;
  profileBio: string;
  setProfileBio: (profileBio: string) => void;
  profileLink: string;
  setProfileLink: (profileLink: string) => void;
  privacy: Privacy;
  setPrivacy: (privacy: Privacy) => void;
}

const useEditProfile = create<ToggleState>((set) => ({
  openDialog: false,
  setOpenDialog: (open) => set({ openDialog: open }),
  fullName: '',
  username: '',
  profilePic: '',
  setProfilePic: (profilePic) => set({ profilePic }),
  profileBio: '',
  setProfileBio: (profileBio) => set({ profileBio }),
  profileLink: '',
  setProfileLink: (profileLink) => set({ profileLink }),
  privacy: Privacy.PUBLIC,
  setPrivacy: (privacy) => set({ privacy }),
}));

export default useEditProfile;
