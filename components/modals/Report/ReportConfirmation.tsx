'use client';

import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const ReportConfirmation = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className='px-4 py-8 text-center flex-col-center'>
      <div className='flex-center bg-white/10 size-[72px] mb-4 rounded-full'>
        <Check className='size-8 text-green-500' />
      </div>
      <h3 className='text-xl font-bold text-white/90 mb-2'>
        Thanks for reporting
      </h3>
      <p className='text-white/75 mb-6'>
        We'll review your report and take appropriate action if there's a
        violation of our Community Guidelines.
      </p>
      <Button
        className='bg-primary-red hover:bg-primary-red/90 text-white w-full rounded-full'
        onClick={onClose}
      >
        Close
      </Button>
    </div>
  );
};

export default ReportConfirmation;
