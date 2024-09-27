'use client';
import useFileUpload from '@/hooks/useFileUpload';
import { EditProfileProps } from '@/lib/types';
import { getFullName } from '@/lib/utils';
import useEditProfile from '@/store/editProfile';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import { Privacy } from '@prisma/client';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Lock } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
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
import { Switch } from '../ui/switch';
import AddBio from './AddBio';
import AddLink from './AddLink';

const EditProfile = ({
  userBio,
  userLink,
  userImage,
  userPrivacy,
}: EditProfileProps) => {
  const {
    openDialog,
    setOpenDialog,
    profileBio,
    setProfileBio,
    profileLink,
    setProfileLink,
    profilePic,
    setProfilePic,
    privacy,
    setPrivacy,
  } = useEditProfile();
  const { user } = useUser();
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { isUploading, uploadProfileImage, resetFiles } = useFileUpload();

  useEffect(() => {
    if (!openDialog) {
      resetTimeoutRef.current = setTimeout(() => {
        if (userImage) {
          setProfilePic(userImage);
        }
      }, 300);
    } else if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
    }
  }, [openDialog, userImage]);

  useEffect(() => {
    if (openDialog) {
      setProfileBio(userBio);
      setProfileLink(userLink);
      setProfilePic(userImage);
      setPrivacy(userPrivacy);
    }
  }, [openDialog, userBio, userLink, userImage, userPrivacy]);

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
        resetFiles();
      },
      onError: () => {
        toast.error('Updating Error: Something went wrong!');
      },
      retry: false,
    });

  const handlePrivacyChange = useCallback(
    (checked: boolean) => {
      setPrivacy(checked ? Privacy.PRIVATE : Privacy.PUBLIC);
    },
    [setPrivacy]
  );

  const handleUpdateProfile = useCallback(async () => {
    const imgUrl = await uploadProfileImage(profilePic);
    await updateProfile({
      image: imgUrl,
      bio: profileBio,
      link: profileLink,
      privacy: privacy || Privacy.PUBLIC,
    });
  }, [
    profileBio,
    profileLink,
    profilePic,
    privacy,
    updateProfile,
    uploadProfileImage,
  ]);

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger className='w-full'>
        <Button
          variant='ghost'
          className='w-full rounded-[10px] border border-border-dark dark:border-border-light hover:bg-transparent dark:hover:bg-transparent'
        >
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className='w-full max-w-lg select-none border-none bg-transparent shadow-none outline-none z-[999]'>
        <DialogHeader>
          <DialogTitle>
            <VisuallyHidden.Root>Edit Profile</VisuallyHidden.Root>
          </DialogTitle>
        </DialogHeader>
        <Card className='rounded-2xl border-none bg-background shadow-2xl ring-1 ring-border-dark dark:ring-border-light ring-offset-0 dark:bg-[#101010] p-6'>
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
                <UploadPicture userImage={userImage} />
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
            <div className='flex flex-col w-full'>
              <Label htmlFor='link' className='text-[15px] font-semibold'>
                Link
              </Label>
              <div className='mb-2 mt-1'>
                <AddLink userLink={userLink} />
              </div>
              <Separator className='bg-border-light h-[0.5px]' />
            </div>
            <div className='flex-between w-full'>
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
            </div>
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
