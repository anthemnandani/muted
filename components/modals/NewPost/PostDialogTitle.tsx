'use client';

import { Icons } from '@/components/icons';
import { DialogTitle as Title } from '@/components/ui/dialog';
import useCreatePost from '@/hooks/useCreatePost';
import { PostDialogTitleProps } from '@/lib/types';
import usePostDialog from '@/store/postDialog';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import DiscardPost from '../DiscardPost';

const PostDialogTitle = ({ hasError, discardPost }: PostDialogTitleProps) => {
  const { setStep, step, setOpenDialog } = usePostDialog();

  const { handleMutation } = useCreatePost();

  const getTitleText = () => {
    if (hasError) return "Media couldn't be uploaded";
    if (step === 'upload') return 'Create new post';
    if (step === 'preview') return 'Preview';
    if (step === 'post') return 'Create new post';
  };

  const handleSubmit = (isEdit = false) => {
    setOpenDialog(false);
    const promise = handleMutation();

    toast.promise(promise, {
      loading: (
        <div className='flex w-[270px] items-center justify-start gap-1.5 p-0'>
          <div>
            <Icons.loading className='size-8' />
          </div>
          {isEdit ? 'Editing...' : 'Posting...'}
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

  return (
    <Title className='flex-between px-4'>
      {step === 'preview' && !hasError ? (
        <DiscardPost discardPost={discardPost} />
      ) : step === 'post' ? (
        <button
          type='button'
          aria-label='Cancel'
          className='font-normal'
          onClick={() => setStep('preview')}
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
          className='text-primary-blue hover:text-white/90 disabled:opacity-50 disabled:hover:text-primary-blue disabled:cursor-not-allowed transition-colors duration-150 text-base font-normal cursor-pointer'
          onClick={() => handleSubmit()}
        >
          Post
        </button>
      )}
    </Title>
  );
};

export default PostDialogTitle;
