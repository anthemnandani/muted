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

  // Mobile pe post step mein stacked layout (preview upar, caption neeche)
  // Desktop pe side-by-side slide animation wala layout
  const isPostStep = step === 'post';

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

        <DialogContent
          className={cn(
            'border-none bg-transparent shadow-none outline-none p-0',
            // Mobile: full width, max height
            'w-[calc(100vw-16px)] max-w-[calc(100vw-16px)]',
            // Desktop: auto width to fit content
            'md:w-auto md:max-w-none',
          )}
        >
          {isUploading ? (
            <div className='flex justify-center w-full px-4'>
              <UploadingView progress={uploadProgress} />
            </div>
          ) : (
            <Fragment>
              {/* ── HEADER ── */}
              <DialogHeader
                className={cn(
                  'w-full',
                  // Desktop slide animation
                  !isMobile && isPostStep &&
                    '-translate-x-[150px] transition-all duration-500 ease-in-out',
                  !isMobile && isPostStep && 'md:w-[calc(500px+340px-150px)]',
                  !isMobile && !isPostStep && 'md:w-[500px]',
                )}
              >
                <PostDialogTitle
                  hasError={!!error}
                  discardPost={handleConfirmDiscard}
                  isLoading={isCreating || isEditing}
                  handleSubmit={handleMainSubmit}
                />
              </DialogHeader>

              {/* ── BODY ── */}
              {isMobile ? (
                // ── MOBILE: stacked layout ──
                <div className='flex flex-col w-full'>
                  <Card
                    className={cn(
                      'relative border-none shadow-2xl ring-1 ring-[#393939] bg-gray-6',
                      'w-full rounded-lg z-10',
                      // compose/preview step: square-ish
                      !isPostStep && 'min-h-[300px] max-h-[60vh]',
                      // post step: preview becomes smaller
                      isPostStep && 'min-h-[240px] max-h-[45vh]',
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

                  {/* Caption panel below preview on mobile */}
                  {isPostStep && (
                    <div className='w-full ring-1 ring-[#393939] bg-gray-6 rounded-lg mt-2 max-h-[35vh] overflow-y-auto'>
                      <CreatePost />
                    </div>
                  )}
                </div>
              ) : (
                // ── DESKTOP: original side-by-side slide animation ──
                <div className='flex'>
                  <Card
                    className={cn(
                      'relative border-none shadow-2xl ring-1 ring-[#393939] bg-gray-6 w-[500px]',
                      'h-full min-h-[500px] max-h-[calc(100vh_-_100px)]',
                      'transition-all duration-500 ease-in-out z-10',
                      isPostStep
                        ? 'rounded-l-lg rounded-r-none -translate-x-[150px]'
                        : 'rounded-lg',
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

                  {isPostStep && (
                    <div
                      className={cn(
                        'relative border-none shadow-2xl ring-1 ring-[#393939] bg-gray-6 w-[340px]',
                        'rounded-r-lg transition-all duration-500 ease-in-out z-20',
                        '-translate-x-[150px] opacity-100',
                      )}
                    >
                      <CreatePost />
                    </div>
                  )}
                </div>
              )}
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