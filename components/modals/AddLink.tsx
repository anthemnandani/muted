'use client';

import useAddLink from '@/store/addLink';
import useEditProfile from '@/store/editProfile';
import { useUser } from '@clerk/nextjs';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Plus } from 'lucide-react';
import { useEffect } from 'react';
import { Card } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { ResizeTextarea } from '../ui/resize-textarea';

const AddLink = () => {
  const { openDialog, setOpenDialog, link, setLink } = useAddLink();
  const { profileLink, setProfileLink } = useEditProfile();
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      setLink((user.publicMetadata?.link as string) || '');
    }
  }, [user, setLink]);

  const handleDone = () => {
    setProfileLink(link);
    setOpenDialog(false);
  };

  const handleCancel = () => {
    profileLink ? setLink(profileLink) : setLink('');
    setOpenDialog(false);
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger className='w-full'>
        <div className='flex items-center'>
          {profileLink ? (
            <span className='text-[#18A3FE] text-[15px] break-all'>
              {profileLink}
            </span>
          ) : (
            <>
              <Plus className='size-3.5 text-[#4D4D4D] mr-1' />
              <span className='text-gray-3 text-[15px]'>Add link</span>
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
            <VisuallyHidden.Root>Add Link</VisuallyHidden.Root>
          </DialogTitle>
        </DialogHeader>
        <div className='flex-between gap-2 mb-2'>
          <span
            className='text-[17px] cursor-pointer text-white'
            onClick={handleCancel}
          >
            Cancel
          </span>
          <span className='text-base font-bold text-white'>Edit link</span>
          <span
            className='text-[#18A3FE] text-[17px] cursor-pointer'
            onClick={handleDone}
          >
            Done
          </span>
        </div>
        <Card className='rounded-2xl border-none bg-background shadow-2xl ring-1 ring-[#393939] ring-offset-0 dark:bg-gray-6'>
          <div className='no-scrollbar h-[215px] overflow-y-auto p-6'>
            <ResizeTextarea
              className='w-full h-full border-none focus:outline-none text-[#18A3FE]'
              placeholder='Add a link...'
              value={link}
              maxLength={240}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default AddLink;
