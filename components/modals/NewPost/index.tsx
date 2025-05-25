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
import useDevice from '@/hooks/useDevice';
import { useFileUpload } from '@/hooks/useFileUpload';
import { cn } from '@/lib/utils';
import useFileStore from '@/store/fileStore';
import usePostDialog from '@/store/postDialog';
import { Fragment, useEffect, useState } from 'react';
import DiscardPost from '../DiscardPost';
import CreatePost from './CreatePost';
import PostDialogTitle from './PostDialogTitle';
import PreviewStep from './PreviewStep';
import UploadError from './UploadError';
import UploadStep from './UploadStep';

const NewPost = () => {
  const { openDialog, setOpenDialog, step, setStep, resetPostState } =
    usePostDialog();

  const { setMediaFiles } = useFileStore();
  const [showDiscardModal, setShowDiscardModal] = useState(false);

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

  useEffect(() => {
    return cleanup;
  }, []);

  const handleDiscardPost = () => {
    setMediaFiles([]);
    resetPostState();
    setOpenDialog(false);
    setShowDiscardModal(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && (step === 'preview' || step === 'post')) {
      setShowDiscardModal(true);
      return;
    }

    setOpenDialog(open);

    if (!open) {
      setMediaFiles([]);
      resetPostState();
    }
  };

  return (
    <Fragment>
      <Dialog open={openDialog} onOpenChange={handleOpenChange}>
        <DialogTrigger>
          {isMobile ? (
            <CreateThreadMobile />
          ) : (
            <div className='hidden md:flex relative size-12 flex-center rounded-xl hover:bg-primary transition-colors duration-150 border-none text-secondary hover:text-foreground'>
              <Icons.plus className='size-6' />
            </div>
          )}
        </DialogTrigger>
        <DialogContent
          className={cn(
            'w-full border-none bg-transparent shadow-none outline-none'
          )}
        >
          <DialogHeader
            className={cn(
              'w-[500px]',
              step === 'post' &&
                '-translate-x-[150px] w-full transition-all duration-500 ease-in-out'
            )}
          >
            <PostDialogTitle
              hasError={!!error}
              discardPost={handleDiscardPost}
            />
          </DialogHeader>
          <div className='flex'>
            <Card
              className={cn(
                'relative border-none shadow-2xl ring-1 ring-[#393939] bg-gray-6 size-[500px] transition-all duration-500 ease-in-out z-10',
                step === 'post'
                  ? 'rounded-l-lg rounded-r-none -translate-x-[150px]'
                  : 'rounded-lg'
              )}
            >
              {isValidating && (
                <Progress
                  value={progress}
                  className='rounded-lg absolute top-0 left-2 right-2 h-1 w-full animate-progress bg-primary-blue'
                />
              )}
              {error && (
                <UploadError
                  title={error.title}
                  message={error.message}
                  onRetry={() => setError(null)}
                />
              )}
              {step === 'upload' && (
                <UploadStep
                  getRootProps={getRootProps}
                  getInputProps={getInputProps}
                  isDragActive={isDragActive}
                />
              )}
              {(step === 'preview' || step === 'post') && (
                <PreviewStep
                  getRootProps={getRootProps}
                  getInputProps={getInputProps}
                  isDragActive={isDragActive}
                />
              )}
            </Card>

            <div
              className={cn(
                'relative border-none shadow-2xl ring-1 ring-[#393939] bg-gray-6 w-[340px] rounded-r-lg transition-all duration-500 ease-in-out',
                step === 'post'
                  ? '-translate-x-[150px] opacity-100'
                  : '-translate-x-[340px] opacity-0'
              )}
            >
              <CreatePost />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DiscardPost
        isOpen={showDiscardModal}
        onOpenChange={setShowDiscardModal}
        discardPost={handleDiscardPost}
      />
    </Fragment>
  );
};

export default NewPost;
