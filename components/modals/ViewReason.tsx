'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const ViewReason = ({ reason }: { reason: string }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <p className='text-sm text-white/65 cursor-pointer truncate hover:text-white/80'>
          {reason}
        </p>
      </DialogTrigger>
      <DialogContent className='bg-gray-6 text-white/90 border-gray-700'>
        <DialogHeader>
          <DialogTitle>User's Appeal Reason</DialogTitle>
        </DialogHeader>
        <div className='mt-4 text-white/80 whitespace-pre-wrap'>{reason}</div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewReason;
