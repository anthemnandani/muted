'use client';

import { Button } from '@/components/ui/button';
import { ReportDetailsProps } from '@/lib/types';

const ReportDetails = ({
  categoryLabel,
  points,
  onSubmit,
  loading,
}: ReportDetailsProps) => {
  return (
    <div className='px-0'>
      <div className='px-5 py-4 bg-zinc-800 border-b border-zinc-800/50'>
        <h3 className='text-xl font-semibold text-white'>{categoryLabel}</h3>
      </div>

      <div className='px-5 py-4'>
        <p className='text-white/90 font-medium mb-4'>
          We don't allow the following:
        </p>

        {points && points.length > 0 && (
          <div className='text-white/90'>
            <ul className='list-disc pl-5 space-y-2'>
              {points.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className='px-5 pb-6 pt-4'>
        <Button
          className='w-full bg-primary-red hover:bg-primary-red/90 text-white rounded-full py-6'
          onClick={onSubmit}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </div>
  );
};

export default ReportDetails;
