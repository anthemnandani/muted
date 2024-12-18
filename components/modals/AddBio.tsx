'use client';

import useAddBio from '@/store/addBio';
import useEditProfile from '@/store/editProfile';
import { DialogTitle } from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Plus } from 'lucide-react';
import { useEffect } from 'react';
import { Card } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '../ui/dialog';
import { ResizeTextarea } from '../ui/resize-textarea';

const AddBio = ({ userBio }: { userBio: string }) => {
  const { openDialog, setOpenDialog, bio, setBio } = useAddBio();
  const { profileBio, setProfileBio } = useEditProfile();

  useEffect(() => {
    if (userBio) {
      setBio(userBio);
    }
  }, [userBio]);

  const handleDone = () => {
    setProfileBio(bio);
    setOpenDialog(false);
  };

  const handleCancel = () => {
    profileBio ? setBio(profileBio) : setBio('');
    setOpenDialog(false);
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger className='w-full'>
        <div className='flex items-center'>
          {profileBio ? (
            <span className='text-start text-[15px] whitespace-pre-line break-words'>
              {profileBio}
            </span>
          ) : (
            <>
              <Plus className='size-3.5 text-[#4D4D4D] mr-1' />
              <span className='text-gray-3 text-[15px]'>Write bio</span>
            </>
          )}
        </div>
      </DialogTrigger>
      <DialogContent
        isSecondDialog
        className='w-full md:max-w-2xl select-none border-none bg-transparent shadow-none outline-none z-[1001]'
      >
        <DialogHeader>
          <DialogTitle>
            <VisuallyHidden.Root>Add Bio</VisuallyHidden.Root>
          </DialogTitle>
        </DialogHeader>
        <div className='flex-between gap-2 mb-2 px-6'>
          <span
            className='text-[17px] cursor-pointer text-white'
            onClick={handleCancel}
          >
            Cancel
          </span>
          <span className='text-base font-bold text-white'>Edit bio</span>
          <span
            className='text-primary-blue text-[17px] cursor-pointer'
            onClick={handleDone}
          >
            Done
          </span>
        </div>
        <Card className='rounded-2xl border-none bg-background shadow-2xl ring-1 ring-[#393939] ring-offset-0 dark:bg-gray-6'>
          <div className='no-scrollbar h-[215px] overflow-y-auto p-6'>
            <ResizeTextarea
              className='w-full h-full border-none focus:outline-none'
              placeholder='Write a bio...'
              value={bio}
              maxLength={150}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default AddBio;
