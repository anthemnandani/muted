'use client';

import { Icons } from '@/components/icons';
import { Progress } from '@/components/ui/progress';

const UploadingView: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div className='w-full max-w-[500px] aspect-square bg-gray-6 rounded-lg flex-col-center p-8 border border-[#393939] shadow-2xl'>
      <div className='relative mb-8 flex-center'>
        <Icons.spinner className='size-20 animate-spin text-primary-blue' />
        <span className='absolute text-sm font-bold text-white/90'>
          {progress}%
        </span>
      </div>

      <h3 className='text-xl font-semibold text-white/90 mb-2'>
        Uploading Post
      </h3>
      <p className='text-white/60 text-center mb-6 text-sm max-w-[80%]'>
        Please keep this window open until the upload completes. We are sending
        your media to the server.
      </p>

      <Progress value={progress} className='w-full h-2 bg-gray-800' />

      <p className='text-sm text-white/50 mt-4 animate-pulse'>
        {progress === 100
          ? 'Finalizing post...'
          : 'Do not close your browser...'}
      </p>
    </div>
  );
};

export default UploadingView;
