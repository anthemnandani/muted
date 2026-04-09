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
import useFileUpload from '@/hooks/useFileUpload';
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
import UploadingView from './UploadingView';
import useBreakpoint from '@/hooks/useBreakpoint';

type NewPostProps = {
  trigger?: React.ReactNode;
};

const NewPost = ({ trigger }: NewPostProps) => {
  const {
    openDialog,
    editPostId,
    setOpenDialog,
    step,
    setStep,
    resetPostState,
  } = usePostDialog();
  const { setMediaFiles, setThreadMedia } = useFileStore();
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const { isMobile } = useBreakpoint();

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
    onSuccess: () => {
      setStep('preview');
    },
  });

  const {
    handleCreatePost,
    handleEditPost,
    cancelUpload,
    isCreating,
    isEditing,
    isUploading,
    uploadProgress,
  } = useCreatePost();

  useEffect(() => {
    return cleanup;
  }, []);

  const cleanUpState = () => {
    setTimeout(() => {
      setMediaFiles([]);
      setThreadMedia(null);
      resetPostState();
    }, 150);
  };

  const handleConfirmDiscard = () => {
    if (isUploading) {
      cancelUpload();
      setShowDiscardModal(false);
    } else {
      setOpenDialog(false);
      setShowDiscardModal(false);
      cleanUpState();
    }
  };

  const handleMainSubmit = () => {
    if (!!editPostId) {
      handleEditPost();
    } else {
      handleCreatePost();
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (isUploading && !open) {
      setShowDiscardModal(true);
      return;
    }
    if (!isEditing && !open && (step === 'preview' || step === 'post')) {
      setShowDiscardModal(true);
      return;
    }

    setOpenDialog(open);

    if (!open) {
      cleanUpState();
    }
  };

  return (
    <Fragment>
      <Dialog open={openDialog} onOpenChange={handleOpenChange} modal={true}>
        <DialogTrigger asChild>
          {trigger ? (
            trigger
          ) : isMobile ? (
            <CreateThreadMobile />
          ) : (
            <div className='hidden md:flex relative size-12 flex-center rounded-xl hover:bg-primary-2 transition-colors duration-150 border-none text-secondary-2 hover:text-foreground'>
              <Icons.plus className='size-6' />
            </div>
          )}
        </DialogTrigger>
        <DialogContent className='w-full border-none bg-transparent shadow-none outline-none'>
          {isUploading ? (
            <div className='flex justify-center w-full'>
              <UploadingView progress={uploadProgress} />
            </div>
          ) : (
            <Fragment>
              <DialogHeader
                className={cn(
                  'w-[500px]',
                  step === 'post' &&
                  '-translate-x-[150px] w-full transition-all duration-500 ease-in-out'
                )}
              >
                <PostDialogTitle
                  hasError={!!error}
                  discardPost={handleConfirmDiscard}
                  isLoading={isCreating || isEditing}
                  handleSubmit={handleMainSubmit}
                />
              </DialogHeader>
              <div className='flex'>
                <Card
                  className={cn(
                    'relative border-none shadow-2xl ring-1 ring-[#393939] bg-gray-6 w-[500px]',
                    'h-full min-h-[500px] max-h-[calc(100vh_-_100px)]',
                    'transition-all duration-500 ease-in-out z-10',
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
                  {error ? (
                    <UploadError
                      title={error.title}
                      message={error.message}
                      onRetry={() => setError(null)}
                    />
                  ) : step === 'compose' ? (
                    <UploadStep
                      getRootProps={getRootProps}
                      getInputProps={getInputProps}
                      isDragActive={isDragActive}
                    />
                  ) : (
                    (step === 'preview' || step === 'post') && (
                      <PreviewStep
                        getRootProps={getRootProps}
                        getInputProps={getInputProps}
                        isDragActive={isDragActive}
                      />
                    )
                  )}
                </Card>
                {step === 'post' && (
                  <div
                    className={cn(
                      'relative border-none shadow-2xl ring-1 ring-[#393939] bg-gray-6 w-[340px]',
                      'rounded-r-lg transition-all duration-500 ease-in-out z-20',
                      step === 'post'
                        ? '-translate-x-[150px] opacity-100'
                        : '-translate-x-[340px] opacity-0'
                    )}
                  >
                    <CreatePost />
                  </div>
                )}
              </div>
            </Fragment>
          )}
        </DialogContent>
      </Dialog>

      <DiscardPost
        isOpen={showDiscardModal}
        onOpenChange={setShowDiscardModal}
        discardPost={handleConfirmDiscard}
      />
    </Fragment>
  );
};

export default NewPost;
