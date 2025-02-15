'use client';

import LinkPreviewCard from '@/components/cards/LinkPreviewCard';
import { Icons } from '@/components/icons';
import CreatePostInput from '@/components/inputs/CreatePostInput';
import PostPrivacyMenu from '@/components/menus/PostPrivacyMenu';
import UsersMenu from '@/components/menus/UsersMenu';
import { Button } from '@/components/ui/button';
import useCreatePost from '@/hooks/useCreatePost';
import useLinkPreview from '@/hooks/useLinkPreview';
import useMentions from '@/hooks/useMentions';
import { cn } from '@/lib/utils';
import usePostDialog from '@/store/postDialog';
import { Check } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { toast } from 'sonner';

const CreatePost = () => {
  const {
    openDialog,
    setOpenDialog,
    replyPostInfo,
    quoteInfo,
    editPostInfo,
    mentions,
    setMentions,
  } = usePostDialog();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // const { isLoading: isCheckingPermissions } = usePostInteraction({
  //   authorId: replyPostInfo?.author?.id!,
  //   privacy: replyPostInfo?.privacy!,
  //   mentions: replyPostInfo?.mentions!,
  // });

  const {
    postData,
    setPostData,
    isLoading,
    isReplying,
    isEditing,
    handleMutation,
  } = useCreatePost(setMentions);

  const { isLinkPreviewLoading } = useLinkPreview(postData?.text, setPostData);

  const {
    mentionSuggestions,
    showMentionSuggestions,
    cursorPosition,
    handleMentionSearch,
    isMentionsLoading,
    insertMention,
  } = useMentions({ textareaRef, setPostData, setMentions, mentions });

  const handleSubmit = (isEdit: boolean) => {
    setOpenDialog(false);
    const promise = handleMutation(mentions);

    toast.promise(promise, {
      loading: (
        <div className='flex w-[270px] items-center justify-start gap-1.5 p-0'>
          <div>
            <Icons.loading className='size-8' />
          </div>
          {isEdit ? 'Editing...' : replyPostInfo ? 'Replying...' : 'Posting...'}
        </div>
      ),
      success: (data) => {
        const postInfo = data?.isEdited ? data?.updatedPost : data?.createPost;
        return (
          <div className='flex-between w-[270px] p-0 '>
            <div className='flex-center gap-1.5'>
              <Check className='size-5' />
              {data?.isEdited ? 'Edited' : 'Posted'}
            </div>
            <Link
              href={`/${postInfo.author.username}/post/${postInfo.id}`}
              className='hover:text-blue-900'
            >
              View
            </Link>
          </div>
        );
      },
      error: 'Error',
      richColors: true,
    });
  };

  const handleFieldChange = (textValue: string) => {
    setPostData({
      ...postData,
      text: textValue,
    });
  };

  return (
    <div className='max-h-[calc(100vh-100px)] overflow-y-auto'>
      {/* {isCheckingPermissions ? (
        <div className='flex-center py-3.5 px-4'>
          <Icons.loading className='size-8' />
        </div>
      ) : ( */}

      <div
        className={cn(
          'p-6',
          (postData.linkPreview || isLinkPreviewLoading) && '!pb-4'
        )}
      >
        {replyPostInfo && (
          <CreatePostInput
            isOpen={openDialog}
            onTextareaChange={handleFieldChange}
            replyPostInfo={replyPostInfo}
            textareaRef={textareaRef}
            value={postData.text}
            setPostData={setPostData}
            handleMentionSearch={handleMentionSearch}
            isReply
          />
        )}
        <CreatePostInput
          isOpen={openDialog}
          onTextareaChange={handleFieldChange}
          quoteInfo={quoteInfo}
          placeholder={
            replyPostInfo
              ? `Reply to ${replyPostInfo?.author?.username}...`
              : 'Write a caption...'
          }
          textareaRef={textareaRef}
          value={postData.text}
          setPostData={setPostData}
          isReply={!!replyPostInfo?.text || !!replyPostInfo?.media}
          handleMentionSearch={handleMentionSearch}
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
      {(postData.linkPreview || isLinkPreviewLoading) && (
        <div className='mx-6'>
          <LinkPreviewCard
            url={postData?.linkPreview?.url!}
            title={postData?.linkPreview?.title || ''}
            description={postData?.linkPreview?.description || ''}
            image={postData?.linkPreview?.image || ''}
            isLoading={isLinkPreviewLoading}
            onClose={() =>
              setPostData((prev) => ({
                ...prev,
                linkPreview: null,
              }))
            }
          />
        </div>
      )}
      <div className='w-full flex-between p-6'>
        <PostPrivacyMenu />
        <Button
          onClick={() => handleSubmit(!!editPostInfo)}
          variant='ghost'
          className='bg-transparent border border-border-dark dark:border-border-light rounded-lg text-[14px] leading-none flex-center hover:bg-transparent dark:hover:bg-transparent disabled:cursor-not-allowed disabled:pointer-events-auto'
          disabled={
            postData?.text === '' || isLoading || isReplying || isEditing
          }
        >
          {(isLoading || isReplying) && (
            <Icons.spinner
              className='mr-2 size-4 animate-spin'
              aria-hidden='true'
            />
          )}
          {editPostInfo ? 'Edit' : 'Post'}
        </Button>
      </div>
    </div>
  );
};

export default CreatePost;
