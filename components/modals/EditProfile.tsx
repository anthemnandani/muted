'use client';
import { useUploadThing } from '@/lib/uploadthing';
import { getFullName, getUsername, isBase64Image } from '@/lib/utils';
import useEditProfile from '@/store/editProfile';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import { Privacy } from '@prisma/client';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Lock, User2 } from 'lucide-react';
import { ChangeEvent, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Icons } from '../icons';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
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

const EditProfile = () => {
  const {
    openDialog,
    setOpenDialog,
    profileBio,
    profileLink,
    profilePic,
    setProfilePic,
    privacy,
    setPrivacy,
  } = useEditProfile();
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userFullName = getFullName(user?.firstName ?? '', user?.lastName ?? '');
  const username = getUsername(user!);
  const [files, setFiles] = useState<File[]>([]);
  const trpcUtils = api.useUtils();

  const { isLoading, mutateAsync: updateProfile } =
    api.user.updateProfile.useMutation({
      onMutate: ({}) => {
        setProfilePic('');
        setFiles([]);
      },
      onError: () => {
        toast.error('Updating Error: Something went wrong!');
      },
      onSettled: async () => {
        await trpcUtils.user.userInfo.invalidate();
      },
      retry: false,
    });

  const { startUpload } = useUploadThing('media');

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const reader = new FileReader();
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFiles(Array.from(e.target.files));
      if (!file.type.includes('image')) return;
      reader.onload = async (event) => {
        const imageUrl = event.target?.result?.toString() || '';
        setProfilePic(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrivacyChange = (checked: boolean) => {
    setPrivacy(checked ? Privacy.PRIVATE : Privacy.PUBLIC);
  };

  const handleMutation = async () => {
    let imgUrl = undefined;
    const hasImageChanged = isBase64Image(profilePic);
    if (hasImageChanged) {
      const imgRes = await startUpload(files);
      if (imgRes && imgRes[0].fileUrl) {
        imgUrl = imgRes[0].fileUrl;
      }
    }
    const promise = updateProfile({
      image: imgUrl,
      bio: profileBio,
      link: profileLink,
      privacy,
    });
    return promise;
  };

  const handleUpdateProfile = async () => {
    await handleMutation();
    setOpenDialog(false);
  };

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
                    {`${userFullName} (@${username})`}
                  </div>
                </div>
                <Separator className='bg-border-light h-[0.5px]' />
              </div>
              <div className='cursor-pointer'>
                <Avatar
                  className='outline outline-1 outline-border size-12'
                  onClick={handleAvatarClick}
                >
                  <AvatarImage
                    src={profilePic || user?.imageUrl}
                    alt={user?.username ?? ''}
                    className='object-cover'
                  />
                  <AvatarFallback>
                    <User2 className='size-5' />
                  </AvatarFallback>
                </Avatar>
                <input
                  title='File Input'
                  type='file'
                  ref={fileInputRef}
                  accept='image/*'
                  className='hidden'
                  onChange={handleImageChange}
                />
              </div>
            </div>
            <div className='flex flex-col w-full'>
              <Label htmlFor='bio' className='text-[15px] font-semibold'>
                Bio
              </Label>
              <div className='mb-2 mt-1'>
                <AddBio />
              </div>
              <Separator className='bg-border-light h-[0.5px]' />
            </div>
            <div className='flex flex-col w-full'>
              <Label htmlFor='link' className='text-[15px] font-semibold'>
                Link
              </Label>
              <div className='mb-2 mt-1'>
                <AddLink />
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
              className='w-full mt-4 rounded-xl bg-foreground hover:bg-foreground select-none text-white dark:text-black'
              onClick={handleUpdateProfile}
              disabled={isLoading}
            >
              {isLoading && (
                <Icons.spinner
                  className='mr-2 h-4 w-4 animate-spin'
                  aria-hidden='true'
                />
              )}
              Done
              <span className='sr-only'>Done</span>
            </Button>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfile;
