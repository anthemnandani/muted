'use client';

import { UPLOAD_CONSTRAINTS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import useEditProfile from '@/store/editProfile';
import useFileStore from '@/store/fileStore';
import { useUser } from '@clerk/nextjs';
import { Plus } from 'lucide-react';
import React from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Separator } from '../ui/separator';

const UploadPicture = () => {
  const { profilePic, setProfilePic } = useEditProfile();
  const { setProfileFile } = useFileStore();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { user } = useUser();

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageUrl = event.target?.result?.toString() || '';
          setProfilePic(imageUrl);
          setProfileFile(file);
        };
        reader.readAsDataURL(file);
      }
    },
    [setProfilePic, setProfileFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      ...UPLOAD_CONSTRAINTS.ACCEPTED_IMAGE_TYPES,
    },
    maxSize: UPLOAD_CONSTRAINTS.MAX_IMAGE_SIZE,
    multiple: false,
    noClick: true,
    onDropRejected: (fileRejections) => {
      const error = fileRejections[0]?.errors[0];
      if (error.code === 'file-too-large') {
        toast.error('Image size should be less than 10MB');
      } else if (error.code === 'file-invalid-type') {
        toast.error('Only JPG, JPEG and PNG files are allowed');
      } else {
        toast.error('Error uploading file');
      }
    },
  });

  const handleRemoveImage = () => {
    setProfilePic(user?.imageUrl as string);
    setProfileFile(null);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result?.toString() || '';
        setProfilePic(imageUrl);
        setProfileFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className={cn(
            'relative size-20 outline outline-1 rounded-full cursor-pointer transition-all duration-200',
            isDragActive
              ? 'outline-primary-red outline-2 ring-4 ring-primary-red/20'
              : 'outline-border',
            isDragActive &&
              'after:absolute after:inset-0 after:bg-primary-red/10 after:rounded-full'
          )}
          {...getRootProps()}
        >
          <Avatar className='rounded-full w-full h-full'>
            <AvatarImage
              src={profilePic}
              alt='Profile Picture'
              className='object-cover'
            />
            <AvatarFallback className='size-20' />
          </Avatar>
          <button
            type='button'
            className='absolute -bottom-2 left-1/2 -translate-x-1/2'
          >
            <div className='bg-primary-red size-7 flex-center rounded-full cursor-pointer hover:scale-105 active:scale-95'>
              <Plus className='size-5 text-neutral-50' />
            </div>
          </button>
          <input {...getInputProps()} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        className='min-w-[190px] p-0 bg-neutral-900 rounded-xl z-[1001]'
      >
        <DropdownMenuItem
          className='px-4 py-3 cursor-pointer'
          onClick={handleUploadClick}
        >
          Upload picture
        </DropdownMenuItem>
        <Separator />

        <DropdownMenuItem
          className='px-4 py-3 cursor-pointer text-primary-red focus:text-primary-red'
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
