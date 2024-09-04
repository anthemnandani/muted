'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import useEditProfile from '@/store/editProfile';
import useFileStore from '@/store/fileStore';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { ChangeEvent, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const UploadPicture = () => {
  const { profilePic, setProfilePic } = useEditProfile();
  const { setFiles } = useFileStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useUser();

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

  const handleRemoveImage = () => {
    setProfilePic(user?.imageUrl as string);
    setFiles([]);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className='cursor-pointer outline outline-1 outline-border size-12'>
          <AvatarImage
            src={profilePic}
            alt='Profile Picture'
            className='object-cover'
          />
          <AvatarFallback>
            <Image src={profilePic} alt='Profile Pic' width={40} height={40} />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='z-[1000]'>
        <DropdownMenuItem
          className='dropdown-menu-item'
          onClick={handleUploadClick}
        >
          Upload Picture
        </DropdownMenuItem>

        <DropdownMenuItem
          className='dropdown-menu-item text-primary-red focus:text-primary-red'
          onClick={handleRemoveImage}
          disabled={profilePic === user?.imageUrl}
        >
          Remove current picture
        </DropdownMenuItem>
      </DropdownMenuContent>
      <input
        title='File Input'
        type='file'
        ref={fileInputRef}
        accept='image/*'
        className='hidden'
        onChange={handleImageChange}
      />
    </DropdownMenu>
  );
};

export default UploadPicture;
