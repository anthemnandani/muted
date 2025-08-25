'use client';

import { useBunnyUpload } from '@/hooks/useBunnyUpload';
import { EditProfileProps } from '@/lib/types';
import { getFullName } from '@/lib/utils';
import useEditProfile from '@/store/editProfile';
import useFileStore from '@/store/fileStore';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Lock } from 'lucide-react';
import { useRef, useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Icons } from '../icons';
import UploadPicture from '../menus/UploadPicture';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import AddBio from './AddBio';

const EditProfile = ({ userBio, userImage }: EditProfileProps) => {
  const {
    openDialog,
    setOpenDialog,
    profileBio,
    setProfileBio,
    profilePic,
    setProfilePic,
  } = useEditProfile();
  const { user } = useUser();
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { profileFile, setProfileFile } = useFileStore();
  const [isUploading, setIsUploading] = useState(false);
  const { uploadToStorage } = useBunnyUpload();

  useEffect(() => {
    if (!openDialog) {
      resetTimeoutRef.current = setTimeout(() => {
        if (userImage) {
          setProfilePic(userImage);
        }
        setProfileFile(null);
      }, 300);
    } else if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
    }
  }, [openDialog, userImage]);

  useEffect(() => {
    if (openDialog) {
      setProfileBio(userBio);
      setProfilePic(userImage);
    }
  }, [openDialog, userBio, userImage]);

  const userFullName = useMemo(
    () => getFullName(user?.firstName ?? '', user?.lastName ?? ''),
    [user]
  );
  const trpcUtils = api.useUtils();

  const { isLoading, mutateAsync: updateProfile } =
    api.user.updateProfile.useMutation({
      onSuccess: async () => {
        await trpcUtils.user.postInfo.invalidate();
        await trpcUtils.user.userInfo.invalidate();
        await trpcUtils.post.getInfinitePosts.invalidate();
        setOpenDialog(false);
        toast.success('Profile updated successfully!');
      },
      onError: () => {
        toast.error('Updating Error: Something went wrong!');
      },
      retry: false,
    });

  const handleUpdateProfile = async () => {
    try {
      setIsUploading(true);
      let imgUrl = profilePic;
      if (profileFile) {
        imgUrl = await uploadToStorage(profileFile);
      }
      await updateProfile({
        image: imgUrl,
        bio: profileBio,
      });
    } catch (error) {
      toast.error('Error updating profile');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger>
        <Button
          size='default'
          variant='destructive'
          className='min-w-[120px] text-base font-medium overflow-hidden text-ellipsis whitespace-nowrap break-words'
        >
          Edit profile
        </Button>
      </DialogTrigger>
      <DialogContent className='w-full max-w-lg select-none border-none bg-transparent shadow-none outline-none z-[999]'>
        <DialogHeader>
          <DialogTitle>
            <VisuallyHidden.Root>Edit Profile</VisuallyHidden.Root>
          </DialogTitle>
        </DialogHeader>
        <Card className='rounded-2xl border-none shadow-2xl ring-1 ring-border-light ring-offset-0 bg-[#101010] p-6'>
          <div className='flex flex-col gap-4'>
            <div className='flex-between'>
              <div className='w-full'>
                <Label htmlFor='username' className='text-[15px] font-semibold'>
                  Name
                </Label>
                <div className='flex items-center gap-2 w-full mt-1 mb-2 h-7'>
                  <Lock className='size-4' />
                  <div className='flex-grow overflow-hidden outline-none text-[15px] text-accent-foreground break-words tracking-wide w-full select-none'>
                    {`${userFullName} (@${user?.username})`}
                  </div>
                </div>
                <Separator className='bg-border-light h-[0.5px]' />
              </div>
              <div className='cursor-pointer'>
                <UploadPicture />
              </div>
            </div>
            <div className='flex flex-col w-full'>
              <Label htmlFor='bio' className='text-[15px] font-semibold'>
                Bio
              </Label>
              <div className='mb-2 mt-1'>
                <AddBio userBio={userBio} />
              </div>
              <Separator className='bg-border-light h-[0.5px]' />
            </div>

            {/* <div className='flex-between w-full'>
              <Label
                htmlFor='profilePrivacy'
                className='text-[15px] font-semibold'
              >
                Private Profile
              </Label>
              <Switch
                id='profilePrivacy'
                checked={privacy === Privacy.PRIVATE}
                onCheckedChange={handlePrivacyChange}
              />
            </div> */}
            <Button
              className='w-full h-[52px] flex-center px-4 mt-4 rounded-xl bg-foreground hover:bg-foreground select-none text-white dark:text-black dark:hover:bg-slate-50 disabled:cursor-not-allowed disabled:pointer-events-auto disabled:opacity-100'
              onClick={handleUpdateProfile}
              disabled={isLoading || isUploading}
            >
              {isLoading || isUploading ? (
                <Icons.loading className='size-8' />
              ) : (
                <span>Done</span>
              )}

              <span className='sr-only'>Done</span>
            </Button>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfile;
