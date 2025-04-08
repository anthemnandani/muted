'use client';

import CreateThreadMobile from '@/components/buttons/CreateThreadMobile';
import { Icons } from '@/components/icons';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import useCreatePost from '@/hooks/useCreatePost';
import useDevice from '@/hooks/useDevice';
import { useFileUpload } from '@/hooks/useFileUpload';
import useFileStore from '@/store/fileStore';
import usePostDialog from '@/store/postDialog';
import React from 'react';
import CreatePost from './CreatePost';
import PostDialogTitle from './PostDialogTitle';
import PreviewStep from './PreviewStep';
import UploadError from './UploadError';
import UploadStep from './UploadStep';

const NewPost = () => {
  const { openDialog, setOpenDialog, step, setStep, resetPostState } =
    usePostDialog();

  const { handleMutation } = useCreatePost();

  const { setMediaFiles } = useFileStore();

  const { isMobile } = useDevice();

  const {
    error,
    setError,
    isValidating,
    progress,
    getRootProps,
    getInputProps,
    isDragActive,
    cleanup,
  } = useFileUpload({
    onSuccess: () => setStep('preview'),
  });

  React.useEffect(() => {
    return cleanup;
  }, []);

  const handleOpenChange = (open: boolean) => {
    setOpenDialog(open);

    if (!open) {
      console.log('Resetting post');
      setMediaFiles([]);
      resetPostState();
    }
  };

  return (
    <Dialog open={openDialog} onOpenChange={handleOpenChange}>
      <DialogTrigger>
        {isMobile ? (
          <CreateThreadMobile />
        ) : (
          <React.Fragment>
            <div className='hidden md:flex relative w-15 h-12 flex-center rounded-xl bg-primary transition-colors duration-150 border-none text-secondary hover:text-foreground'>
              <Icons.plus className='size-6' />
            </div>
          </React.Fragment>
        )}
      </DialogTrigger>
      <DialogContent className='relativew-full border-none bg-transparent shadow-none outline-none'>
        <DialogHeader>
          <PostDialogTitle
            hasError={!!error}
            discardPost={() => {
              resetPostState();
            }}
          />
        </DialogHeader>

        <Card className='relative rounded-2xl border-none shadow-2xl ring-1 ring-[#393939] bg-gray-6'>
          {isValidating && (
            <Progress
              value={progress}
              className='rounded-2xl absolute top-0 left-2 right-2 h-1 w-full animate-progress bg-primary-blue'
            />
          )}
          {error ? (
            <UploadError
              title={error.title}
              message={error.message}
              onRetry={() => setError(null)}
            />
          ) : step === 'upload' ? (
            <UploadStep
              getRootProps={getRootProps}
              getInputProps={getInputProps}
              isDragActive={isDragActive}
            />
          ) : step === 'preview' ? (
            <PreviewStep
              getRootProps={getRootProps}
              getInputProps={getInputProps}
              isDragActive={isDragActive}
            />
          ) : (
            <CreatePost />
          )}
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default NewPost;
