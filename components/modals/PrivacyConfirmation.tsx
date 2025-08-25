'use client';

import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Dialog, DialogContent } from '../ui/dialog';

interface PrivacyConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const PrivacyConfirmation: React.FC<PrivacyConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={true}>
      <DialogContent
        className={cn(
          'p-0 border-none bg-[#121212] text-white/90 overflow-hidden rounded-xl',
          'shadow-[0_2px_12px_rgba(0,0,0,0.12)] !max-w-sm'
        )}
      >
        <div className='px-4 py-8 text-center flex flex-col items-center'>
          <h3 className='text-2xl font-bold text-white/90 mb-2'>
            Switch to public account?
          </h3>
          <p className='text-white/75 mb-6 max-w-sm'>
            If you switch to a public account, anyone can watch your videos. You
            won’t need to approve followers and all pending follow requests will
            be automatically approved.
          </p>
          <div className='flex w-full gap-3'>
            <Button
              className='flex-1 text-base bg-white/10 hover:bg-white/20 text-white w-full rounded-lg'
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className='flex-1 text-base bg-transparent hover:bg-primary-blue/10 border border-primary-blue text-primary-blue w-full rounded-lg'
              onClick={onConfirm}
            >
              Confirm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyConfirmation;
