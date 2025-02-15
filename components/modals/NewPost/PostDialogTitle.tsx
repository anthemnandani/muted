'use client';

import { Icons } from '@/components/icons';
import { DialogTitle as Title } from '@/components/ui/dialog';
import { PostDialogTitleProps } from '@/lib/types';
import usePostDialog from '@/store/postDialog';
import DiscardPost from '../DiscardPost';

const PostDialogTitle = ({ hasError, discardPost }: PostDialogTitleProps) => {
  const { setStep, step } = usePostDialog();

  const getTitleText = () => {
    if (hasError) return "Media couldn't be uploaded";
    if (step === 'upload') return 'Create new post';
    if (step === 'preview') return 'Preview';
    if (step === 'post') return 'Create new post';
  };

  return (
    <Title className='flex-between px-4'>
      {step === 'preview' && !hasError ? (
        <DiscardPost discardPost={discardPost} />
      ) : step === 'post' ? (
        <button
          type='button'
          className='font-normal'
          onClick={() => setStep('preview')}
        >
          <Icons.cancel className='size-5 text-white' />
        </button>
      ) : null}

      <span className='flex-1 text-center text-base font-bold text-white'>
        {getTitleText()}
      </span>

      {step === 'preview' && !hasError && (
        <span
          className='text-primary-blue hover:text-white transition-colors duration-150 text-base font-normal cursor-pointer'
          onClick={() => {
            setStep('post');
          }}
        >
          Next
        </span>
      )}
    </Title>
  );
};

export default PostDialogTitle;
