import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { UploadErrorProps } from '@/lib/types';

const UploadError = ({ title, message, onRetry }: UploadErrorProps) => {
  return (
    <div className='flex-col-center p-8 text-center'>
      <div className='mb-4'>
        <Icons.alertCircle className='size-24 text-neutral-100' />
      </div>
      <h3 className='mb-2 text-xl font-semibold text-neutral-100'>{title}</h3>
      <p className='mb-6 text-sm text-neutral-400'>{message}</p>
      <Button
        onClick={onRetry}
        className='bg-primary-blue hover:bg-primary-blue/90 text-neutral-100 transition-colors duration-150'
        variant='default'
      >
        Select other files
      </Button>
    </div>
  );
};

export default UploadError;
