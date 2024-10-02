'use client';

import { Icons } from '@/components/icons';
import { ResizeTextarea } from '@/components/ui/resize-textarea';
import type { CreateThreadInputProps } from '@/lib/types';
import { cn, formatTimeAgo, getFullName } from '@/lib/utils';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import React from 'react';
import UserAvatar from '../shared/UserAvatar';
import Username from '../user/Username';
import ThreadQuoteCard from '../cards/ThreadQuoteCard';

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

  const { data } = api.user.userInfo.useQuery({ username: user?.username! });

  const [inputValue, setInputValue] = React.useState('');

  const handleResizeTextareaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    onTextareaChange(newValue);
  };

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
            {/* TODO: This is temp solution to maintain layout */}
            <div className='w-3 h-3 invisible'>
              <Icons.verified className='w-3 h-3' />
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
                  __html: replyThreadInfo.text.replace(/\\n/g, '\n'),
                }}
              />
            </div>
            {/* {replyThreadInfo?.images && replyThreadInfo?.images?.length > 0 &&
                            <PostImageCard image={replyThreadInfo.images[0]} />
                        } */}
          </>
        ) : (
          <>
            <ResizeTextarea
              name='text'
              value={inputValue}
              onChange={handleResizeTextareaChange}
              placeholder={placeholder}
              maxLength={200}
            />
          </>
        )}

        {/* {!replyThreadInfo?.text &&
                    <div {...getRootProps()}
                        ref={scrollDownRef}
                        className='space-y-2 mt-1 select-none w-fit'>
                        <div className='text-[#777777] flex gap-1 select-none items-center text-[15px]'>
                            <input {...getInputProps()} />
                            <Icons.image className='h-5 w-5 select-none transform active:scale-75 transition-transform cursor-pointer' />
                        </div>
                    </div>
                }
                    */}

        {quoteInfo && (
          <ThreadQuoteCard {...quoteInfo} createdAt={quoteInfo.createdAt} />
        )}
      </div>
    </div>
  );
};

export default CreateThreadInput;
