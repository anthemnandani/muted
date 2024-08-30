'use client';
import useDialog from '@/store/dialog';
import React from 'react';
import CreateThreadDesktop from '../buttons/CreateThreadDesktop';
import CreateThreadInput from '../inputs/CreateThreadInput';
import PostPrivacyMenu from '../menus/PostPrivacyMenu';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import useWindow from '@/hooks/useWindow';
import CreateThreadMobile from '../buttons/CreateThreadMobile';

const CreateThread = () => {
  const {
    openDialog,
    setOpenDialog,
    replyPostInfo,
    setReplyPostInfo,
    quoteInfo,
    setQuoteInfo,
  } = useDialog();
  const [threadData, setThreadData] = React.useState({
    // privacy: postPrivacy,
    text: '',
  });
  const handleFieldChange = (textValue: string) => {
    setThreadData({
      ...threadData,
      text: textValue,
    });
  };
  const { isMobile } = useWindow();
  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger>
        {isMobile ? <CreateThreadMobile /> : <CreateThreadDesktop />}
      </DialogTrigger>
      <DialogContent className='w-full max-w-lg select-none border-none bg-transparent shadow-none outline-none sm:max-w-[668px]'>
        <h1 className='mb-2 w-full text-center font-bold text-white'>
          {replyPostInfo ? 'Reply' : 'New thread'}
        </h1>
        <Card className='rounded-2xl border-none bg-background shadow-2xl ring-1 ring-[#393939] ring-offset-0 dark:bg-gray-6'>
          <div className='no-scrollbar max-h-[70vh] overflow-y-auto p-6'>
            <CreateThreadInput
              isOpen={openDialog}
              onTextareaChange={handleFieldChange}
              quoteInfo={quoteInfo}
            />
          </div>
          <div className='w-full flex-between p-6'>
            <PostPrivacyMenu />
            <Button
              variant='ghost'
              className='bg-transparent border border-border-dark dark:border-border-light rounded-lg text-[14px] leading-none flex-center hover:bg-transparent dark:hover:bg-transparent disabled:cursor-not-allowed disabled:pointer-events-auto'
              disabled={threadData?.text === ''}
            >
              Post
            </Button>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default CreateThread;
