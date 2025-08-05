'use client';

import CreatePostInput from '@/components/inputs/CreatePostInput';
import UsersMenu from '@/components/menus/UsersMenu';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import useMentions from '@/hooks/useMentions';
import { CreateThreadProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import usePostDialog from '@/store/postDialog';
import { useRef, useEffect } from 'react';

const CreateThread = ({
  getRootProps,
  getInputProps,
  isLoading,
  handleSubmit,
}: CreateThreadProps) => {
  const { postData, setPostData, editPostId } = usePostDialog();

  const handleFieldChange = (textValue: string) => {
    setPostData({
      ...postData,
      threadText: textValue,
    });
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editPostId && textareaRef.current) {
      const textLength = textareaRef.current.value.length;
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(textLength, textLength);
    }
  }, [editPostId]);

  const handleSwitchChange = (key: 'hideLikes' | 'turnOffComments') => {
    setPostData({
      ...postData,
      [key]: !postData[key],
    });
  };

  const {
    mentionSuggestions,
    showMentionSuggestions,
    cursorPosition,
    handleMentionSearch,
    isMentionsLoading,
    insertMention,
  } = useMentions({
    textareaRef,
    setCommentText: (value: string) =>
      setPostData({ ...postData, threadText: value }),
  });

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-1 pt-6'>
        <CreatePostInput
          onTextareaChange={handleFieldChange}
          placeholder='Start a thread'
          textareaRef={textareaRef}
          value={postData.threadText}
          setPostData={setPostData}
          handleMentionSearch={handleMentionSearch}
          getRootProps={getRootProps}
          getInputProps={getInputProps}
        />
      </div>
      {showMentionSuggestions && (
        <UsersMenu
          showMentionSuggestions={showMentionSuggestions}
          mentionSuggestions={mentionSuggestions}
          cursorPosition={cursorPosition}
          isLoading={isMentionsLoading}
          onSelect={insertMention}
        />
      )}
      {/* {(threadData.linkPreview || isLinkPreviewLoading) && (
          <div className='mx-6'>
            <LinkPreviewCard
              url={threadData?.linkPreview?.url!}
              title={threadData?.linkPreview?.title || ''}
              description={threadData?.linkPreview?.description || ''}
              image={threadData?.linkPreview?.image || ''}
              isLoading={isLinkPreviewLoading}
              onClose={() =>
                setThreadData((prev) => ({
                  ...prev,
                  linkPreview: null,
                }))
              }
            />
          </div>
        )} */}
      <div className='flex flex-col gap-2'>
        <div className='flex items-center gap-2'>
          <span className='text-sm text-white/90'>
            Hide like count on this post
          </span>
          <Switch
            disabled={isLoading}
            checked={postData.hideLikes}
            onCheckedChange={() => handleSwitchChange('hideLikes')}
          />
        </div>

        <div className='flex items-center gap-2'>
          <span className='text-sm text-white/90'>Turn off commenting</span>
          <Switch
            disabled={isLoading}
            checked={postData.turnOffComments}
            onCheckedChange={() => handleSwitchChange('turnOffComments')}
          />
        </div>
        <div className='w-full mt-2'>
          <Button
            onClick={() => handleSubmit(!!editPostId)}
            disabled={isLoading || postData.threadText.length === 0}
            variant='ghost'
            className={cn(
              'w-full bg-white/90 text-black border border-border-light rounded-lg text-[14px] leading-none',
              'flex-center hover:bg-white/90 hover:text-black disabled:cursor-not-allowed disabled:pointer-events-auto'
            )}
          >
            {editPostId ? 'Edit' : 'Post'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateThread;
