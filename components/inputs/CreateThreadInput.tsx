'use client';

import { Icons } from '@/components/icons';
import { ResizeTextarea } from '@/components/ui/resize-textarea';
import type { CreateThreadInputProps } from '@/lib/types';
import { cn, formatTimeAgo, getFullName } from '@/lib/utils';
import useFileStore from '@/store/fileStore';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import { X } from 'lucide-react';
import React from 'react';
import { useDropzone, type Accept } from 'react-dropzone';
import ThreadImageCard from '../cards/ThreadImageCard';
import ThreadQuoteCard from '../cards/ThreadQuoteCard';
import UserAvatar from '../shared/UserAvatar';
import { Button } from '../ui/button';
import Username from '../user/Username';

const CreateThreadInput: React.FC<CreateThreadInputProps> = ({
  isOpen,
  replyThreadInfo,
  onTextareaChange,
  placeholder,
  quoteInfo,
}) => {
  const { user } = useUser();
  const userFullName = React.useMemo(
    () => getFullName(user?.firstName ?? '', user?.lastName ?? ''),
    [user]
  );
  const { setSelectedFile } = useFileStore();

  const maxSize = 16 * 1024 * 1024;

  const { data } = api.user.userInfo.useQuery({ username: user?.username! });

  const [inputValue, setInputValue] = React.useState('');
  const [previewType, setPreviewType] = React.useState<
    'image' | 'video' | null
  >(null);
  const [previewURL, setPreviewURL] = React.useState<string | undefined>(
    undefined
  );

  const handleResizeTextareaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    onTextareaChange(newValue);
  };

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      const acceptedFile = acceptedFiles[0];

      if (!acceptedFile) {
        alert('Selected file is too large!');
        return;
      }

      const previewURL = URL.createObjectURL(acceptedFile);
      setPreviewURL(previewURL);

      if (acceptedFile.type.startsWith('image/')) {
        setPreviewType('image');
      } else if (acceptedFile.type.startsWith('video/')) {
        setPreviewType('video');
      }

      setSelectedFile(acceptedFiles);
    },
    [maxSize]
  );

  const accept: Accept = {
    'image/*': [],
    'video/*': [],
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept,
    maxSize,
  });

  const scrollDownRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    scrollDownRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    });
  }, [isOpen]);

  return (
    <div
      className={cn('flex space-x-3', {
        'mt-1': !replyThreadInfo,
      })}
    >
      <div className='relative flex flex-col items-center'>
        {replyThreadInfo ? (
          <UserAvatar
            image={replyThreadInfo.author.image}
            username={replyThreadInfo.author.username}
            fullname={replyThreadInfo.author.fullName}
          />
        ) : (
          <UserAvatar
            image={data?.userDetails?.image || ''}
            username={user?.username!}
            fullname={userFullName}
          />
        )}

        {replyThreadInfo?.text && (
          <div className='h-full w-0.5 bg-[#D8D8D8] dark:bg-[#313639] rounded-full mt-1.5 my-1' />
        )}
      </div>

      <div className='flex flex-col w-full gap-1.5 pb-4'>
        {replyThreadInfo ? (
          <div className='flex items-center gap-2'>
            <Username author={replyThreadInfo.author} />
            <time className='text-[15px] leading-none text-gray-3'>
              {formatTimeAgo(replyThreadInfo.createdAt)}
            </time>
            <div className='size-3 invisible'>
              <Icons.verified className='size-3' />
            </div>
          </div>
        ) : (
          <span className='text-[15px] font-medium leading-none tracking-normal'>
            {user?.username}
          </span>
        )}

        {replyThreadInfo ? (
          <>
            <div className='flex-grow resize-none overflow-hidden outline-none text-[15px] text-accent-foreground break-words placeholder:text-[#777777] w-full tracking-normal whitespace-pre-line'>
              <div
                dangerouslySetInnerHTML={{
                  __html: replyThreadInfo.text?.replace(/\\n/g, '\n') || '',
                }}
              />
            </div>
            {replyThreadInfo?.media &&
              replyThreadInfo?.media?.fileType === 'image' && (
                <ThreadImageCard image={replyThreadInfo.media.fileUrl} />
              )}
          </>
        ) : (
          <>
            <ResizeTextarea
              name='text'
              value={inputValue}
              onChange={handleResizeTextareaChange}
              placeholder={placeholder}
              maxLength={5000}
            />
            {previewURL && (
              <div className='relative overflow-hidden rounded-xl border border-border w-fit'>
                {previewType === 'image' && (
                  <img
                    src={previewURL}
                    alt=''
                    className='object-contain max-h-[520px] max-w-full rounded-md'
                  />
                )}
                {previewType === 'video' && (
                  <video
                    src={previewURL}
                    className='object-contain max-h-[520px] max-w-full rounded-md'
                    loop
                    muted
                    autoPlay
                    playsInline
                  />
                )}

                <Button
                  onClick={() => {
                    setSelectedFile([]);
                    setPreviewURL('');
                    setPreviewType(null);
                  }}
                  variant='ghost'
                  className='size-[25px] p-1 absolute top-2 right-2 z-50 rounded-full transform active:scale-75 transition-transform cursor-pointer bg-background '
                >
                  <X />
                </Button>
              </div>
            )}
          </>
        )}

        {!replyThreadInfo?.text && (
          <div
            {...getRootProps()}
            ref={scrollDownRef}
            className='space-y-2 mt-1 select-none w-fit'
          >
            <div className='text-gray-3 flex gap-1 select-none items-center text-[15px]'>
              <input {...getInputProps()} />
              <Icons.image className='size-5 select-none transform active:scale-75 transition-transform cursor-pointer' />
            </div>
          </div>
        )}

        {quoteInfo && (
          <ThreadQuoteCard {...quoteInfo} createdAt={quoteInfo.createdAt} />
        )}
      </div>
    </div>
  );
};

export default CreateThreadInput;
