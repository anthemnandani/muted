'use client';

import { Icons } from '@/components/icons';
import { ResizeTextarea } from '@/components/ui/resize-textarea';
import { FileType } from '@/generated/prisma/enums';
import { CreateThreadInputProps } from '@/lib/types';
import { getFullName } from '@/lib/utils';
import useFileStore from '@/store/fileStore';
import { useThreadStore } from '@/store/threadStore';
import { useUser } from '@clerk/nextjs';
import { IGif } from '@giphy/js-types';
import { X } from 'lucide-react';
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDropzone, type Accept } from 'react-dropzone';
import { toast } from 'sonner';
import ThreadQuoteCard from '../cards/ThreadQuoteCard';
import EmojiPicker from '../modals/EmojiPicker';
import GifPicker from '../modals/GifPicker';
import UserAvatar from '../shared/UserAvatar';
import { Button } from '../ui/button';
import useBreakpoint from '@/hooks/useBreakpoint';

const CreateThreadInput: React.FC<CreateThreadInputProps> = ({
  placeholder,
  textareaRef,
  handleMentionSearch,
  isUploading,
  uploadProgress,
}) => {
  const { isMobile } = useBreakpoint();
  const { user } = useUser();
  const { openDialog, text, setText, quoteInfo, editThreadInfo } =
    useThreadStore();

  const userFullName = useMemo(
    () => getFullName(user?.firstName ?? '', user?.lastName ?? ''),
    [user],
  );

  const { setThreadMedia } = useFileStore();

  const maxSize = 512 * 1024 * 1024;

  const [previewType, setPreviewType] = useState<'image' | 'video' | null>(
    null,
  );
  const [previewURL, setPreviewURL] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (editThreadInfo && textareaRef.current) {
      setTimeout(() => {
        const length = textareaRef.current?.value.length || 0;
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(length, length);
      }, 0);
    }
  }, [editThreadInfo, textareaRef]);

  const handleEmojiSelect = (emoji: string) => {
    const cursorPosition = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = text.slice(0, cursorPosition);
    const textAfterCursor = text.slice(cursorPosition);

    const newText = textBeforeCursor + emoji + textAfterCursor;

    handleResizeTextareaChange({
      target: { value: newText },
    } as React.ChangeEvent<HTMLTextAreaElement>);

    if (!isMobile) {
      setTimeout(() => {
        if (textareaRef.current) {
          const newPosition = cursorPosition + emoji.length;
          textareaRef.current.selectionStart = newPosition;
          textareaRef.current.selectionEnd = newPosition;
          textareaRef.current.focus();
        }
      }, 0);
    }
  };

  const handleResizeTextareaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const newValue = event.target.value;
    handleMentionSearch(newValue, event.target.selectionStart || 0);
    setText(newValue);
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const acceptedFile = acceptedFiles[0];

      if (!acceptedFile) {
        toast.error('Selected file is too large!');
        return;
      }

      const previewURL = URL.createObjectURL(acceptedFile);
      setPreviewURL(previewURL);

      if (acceptedFile.type.startsWith('image/')) {
        setPreviewType('image');
      } else if (acceptedFile.type.startsWith('video/')) {
        setPreviewType('video');
      }

      setThreadMedia({
        id: crypto.randomUUID(),
        file: acceptedFile,
        preview: previewURL,
        type: acceptedFile.type as FileType,
      });
    },
    [maxSize],
  );

  const accept: Accept = {
    'image/*': [],
    'video/*': [],
    'image/gif': [],
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles: 1,
  });

  const scrollDownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollDownRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    });
  }, [openDialog]);

  return (
    <div className='flex space-x-3 mt-1'>
      <UserAvatar
        image={user?.imageUrl || ''}
        username={user?.username!}
        fullname={userFullName}
      />

      <div className='flex flex-col w-full gap-1.5 pb-4'>
        <span className='text-[15px] font-medium leading-none tracking-normal'>
          {user?.username}
        </span>

        <Fragment>
          <ResizeTextarea
            name='text'
            forwardedRef={textareaRef}
            value={text}
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
                  className='object-contain max-h-[360px] max-w-full'
                />
              )}
              {previewType === 'video' && (
                <video
                  src={previewURL}
                  className='object-contain max-h-[360px] max-w-full'
                  loop
                  muted
                  autoPlay
                  playsInline
                />
              )}

              {isUploading && (
                <div className='absolute inset-0 z-40 bg-black/50 flex-col-center backdrop-blur-[1px]'>
                  <div className='w-[80%] max-w-[200px] h-2 bg-white/20 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-primary-blue transition-all duration-200 ease-out'
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className='text-white text-xs font-medium mt-2'>
                    Uploading... {Math.round(uploadProgress!)}%
                  </span>
                </div>
              )}

              {!isUploading && (
                <Button
                  onClick={() => {
                    setThreadMedia(null);
                    setPreviewURL('');
                    setPreviewType(null);
                  }}
                  variant='ghost'
                  className='size-[25px] p-1 absolute top-2 right-2 z-50 rounded-full transform active:scale-75 transition-transform cursor-pointer bg-background '
                >
                  <X />
                </Button>
              )}
            </div>
          )}
        </Fragment>
        <div className='flex items-center gap-2'>
          {!editThreadInfo?.text && (
            <Fragment>
              <div
                {...getRootProps()}
                ref={scrollDownRef}
                className='space-y-2 mt-1 select-none w-fit'
              >
                <div className='text-white/50 flex gap-1 select-none items-center text-[15px]'>
                  <input {...getInputProps()} />
                  <Icons.image className='size-5 select-none transform active:scale-75 transition-transform cursor-pointer' />
                </div>
              </div>

              <GifPicker
                onGifSelect={(gif: IGif) => {
                  setPreviewURL(gif.images.original.url);
                  setThreadMedia(gif);
                  setPreviewType('image');
                }}
              />
            </Fragment>
          )}
          <EmojiPicker onChange={handleEmojiSelect} />
        </div>

        {quoteInfo && <ThreadQuoteCard {...quoteInfo} />}
      </div>
    </div>
  );
};

export default CreateThreadInput;
