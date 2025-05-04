'use client';

import { Textarea } from '@/components/ui/textarea';
import { ReportDetailsProps } from '@/lib/types';
import { useReportStore } from '@/store/reportStore';
import { useState } from 'react';
import UserSearchInput from './UserSearchInput';

const ReportDetails = ({
  categoryLabel,
  points,
  showAdditionalForm,
  showUserSearch,
  isUserReport,
}: ReportDetailsProps) => {
  const { additionalInfo, setAdditionalInfo } = useReportStore();
  const [charCount, setCharCount] = useState(0);
  const maxChars = 200;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= maxChars) {
      setAdditionalInfo(text);
      setCharCount(text.length);
    }
  };

  return (
    <div className='px-0 relative pb-24'>
      <div className='w-full px-5 py-3 bg-zinc-800 border-b border-zinc-800/50'>
        <h3 className='text-lg font-semibold text-white/90'>
          {showUserSearch && isUserReport
            ? 'Report reason: Pretending to Be Someone'
            : categoryLabel}
        </h3>
      </div>
      {showUserSearch ? (
        <UserSearchInput isUserReport={isUserReport} />
      ) : (
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
      )}
      {showAdditionalForm && (
        <div className='px-5 py-4'>
          <p className='text-white/90 font-semibold text-lg mb-3'>
            Report description
          </p>
          <Textarea
            placeholder='Provide additional details to help us better understand the problem.'
            className='!bg-white-8 border-none text-white/90 resize-none h-48 rounded-md text-base focus-visible:ring-0 focus-visible:ring-offset-0'
            value={additionalInfo || ''}
            onChange={handleTextChange}
          />
          <div className='flex justify-end mt-2'>
            <span className='text-white/60 text-sm'>
              {charCount}/{maxChars}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDetails;
