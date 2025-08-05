'use client';

import { Icons } from '@/components/icons';
import { DialogTitle as Title } from '@/components/ui/dialog';
import { PostDialogTitleProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import usePostDialog from '@/store/postDialog';
import DiscardPost from '../DiscardPost';

const PostDialogTitle = ({
  hasError,
  discardPost,
  handleSubmit,
  isLoading,
}: PostDialogTitleProps) => {
  const { setStep, step, editPostId } = usePostDialog();

  const getTitleText = () => {
    if (hasError) return "Media couldn't be uploaded";
    if (editPostId) return 'Edit Post';
    if (step === 'compose') return 'Create new post';
    if (step === 'preview') return 'Preview';
    if (step === 'post') return 'Create new post';
  };

  return (
    <Title className='flex-between px-4'>
      {!editPostId && step === 'preview' && !hasError ? (
        <DiscardPost discardPost={discardPost} showTrigger={true} />
      ) : step === 'post' && !editPostId ? (
        <button
          type='button'
          aria-label='Cancel'
          className='font-normal'
          onClick={() => setStep('preview')}
          disabled={isLoading}
        >
          <Icons.cancel className='size-5 text-white/90' />
        </button>
      ) : null}

      <span className='flex-1 text-center text-base font-bold text-white/90'>
        {getTitleText()}
      </span>

      {step === 'preview' && !hasError && (
        <span
          className='text-primary-blue hover:text-white/90 transition-colors duration-150 text-base font-normal cursor-pointer'
          onClick={() => {
            setStep('post');
          }}
        >
          Next
        </span>
      )}
      {step === 'post' && !hasError && (
        <button
          type='button'
          className={cn(
            'text-primary-blue hover:text-white/90 disabled:opacity-50',
            'disabled:hover:text-primary-blue disabled:cursor-not-allowed transition-colors',
            'duration-150 text-base font-normal cursor-pointer'
          )}
          onClick={() => handleSubmit(!!editPostId)}
          disabled={isLoading}
        >
          {editPostId ? 'Edit' : 'Post'}
        </button>
      )}
    </Title>
  );
};

export default PostDialogTitle;
