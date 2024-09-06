'use client';
import { CreateThreadInputProps } from '@/lib/types';
import { cn, getFullName, getUsername } from '@/lib/utils';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import React from 'react';
import UserAvatar from '../shared/UserAvatar';
import { ResizeTextarea } from '../ui/resize-textarea';

const CreateThreadInput: React.FC<CreateThreadInputProps> = ({
  isOpen,
  replyThreadInfo,
  onTextareaChange,
}) => {
  const { user } = useUser();
  const userFullName = React.useMemo(
    () => getFullName(user?.firstName ?? '', user?.lastName ?? ''),
    [user]
  );
  const username = React.useMemo(() => getUsername(user!), [user]) as string;
  const { data, isLoading } = api.user.userInfo.useQuery({ username });
  const [inputValue, setInputValue] = React.useState('');

  const handleResizeTextareaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    onTextareaChange(newValue);
  };

  // const scrollDownRef = React.useRef<HTMLDivElement | null>(null);

  // React.useEffect(() => {
  //   scrollDownRef.current?.scrollIntoView({
  //     behavior: 'smooth',
  //     block: 'nearest',
  //     inline: 'start',
  //   });
  // }, [isOpen]);

  return (
    <div
      className={cn('flex space-x-3', {
        'mt-1': !replyThreadInfo,
      })}
    >
      <div className='relative flex-col-center'>
        <UserAvatar
          image={isLoading ? user?.imageUrl : data?.userDetails?.image}
          username={username}
          fullname={userFullName}
        />
      </div>
      <div className='flex flex-col w-full gap-1.5 pb-4'>
        <span className='text-[15px] font-medium leading-none tracking-normal'>
          {username}
        </span>
        <ResizeTextarea
          name='text'
          value={inputValue}
          onChange={handleResizeTextareaChange}
          placeholder='Start a thread...'
          maxLength={200}
        />
        {/* {!replyThreadInfo?.text && (
          <div
            // {...getRootProps()}
            ref={scrollDownRef}
            className='space-y-2 mt-1 select-none w-fit'
          >
            <div className='text-gray-3 flex gap-1 select-none items-center text-[15px]'>
              <input placeholder='Anyone can reply...' />
              <Icons.image className='size-5 select-none transform active:scale-75 transition-transform cursor-pointer' />
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default CreateThreadInput;
