import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { DeleteUserFooterProps } from '@/lib/types';

const DeleteUserFooter = ({
  btnTitle,
  onClick,
  isLoading,
  onCancel,
}: DeleteUserFooterProps) => {
  return (
    <div className='absolute bottom-0 left-0 right-0 px-5 py-6 bg-[#121212] border-t border-border-light'>
      <div className='flex justify-end gap-3'>
        {onCancel && (
          <Button
            variant='ghost'
            className='text-white/75 hover:text-white hover:bg-white/5'
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={onClick}
          disabled={isLoading}
          className='min-w-32 bg-red-600 hover:bg-red-700 text-white'
        >
          {isLoading ? (
            <Icons.spinner className='size-4 animate-spin' />
          ) : (
            btnTitle
          )}
        </Button>
      </div>
    </div>
  );
};

export default DeleteUserFooter;
