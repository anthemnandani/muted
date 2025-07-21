'use client';

import ReportConfirmation from '@/components/modals/Report/ReportConfirmation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MESSAGE_REPORT_CATEGORIES } from '@/lib/constants';
import { MessageReportProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import useReportMessageStore from '@/store/reportMessageStore';
import { api } from '@/trpc/react';
import { X } from 'lucide-react';
import { useEffect, useState, Fragment } from 'react';
import { toast } from 'sonner';

const MessageReport = ({
  messageId,
  isOpen,
  onOpenChange,
}: MessageReportProps) => {
  const { closeReport, reportData, setReportData, reset } =
    useReportMessageStore();
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        reset();
      }, 100);
    }
  }, [isOpen]);

  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { mutate: createReportMessage } = api.chat.reportMessage.useMutation({
    onSuccess: () => {
      setLoading(false);
      onOpenChange(false);
      setTimeout(() => {
        setShowConfirmation(true);
      }, 200);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit report');
      setLoading(false);
    },
  });

  const handleSubmitReport = () => {
    if (!reportData) return;
    setLoading(true);
    createReportMessage({
      messageId,
      category: reportData.category,
      reason: reportData.reason,
    });
  };

  return (
    <Fragment>
      <Dialog open={isOpen} onOpenChange={onOpenChange} modal={true}>
        <DialogContent
          className={cn(
            'p-0 border-none bg-[#121212] text-white/90 overflow-hidden rounded-xl',
            '!max-w-[700px] h-screen shadow-[0_2px_12px_rgba(0,0,0,0.12)] flex flex-col'
          )}
        >
          <ScrollArea className='flex-1 w-full'>
            <div className='flex-between px-6 h-18'>
              <h2 className='text-2xl font-bold text-white/90'>Report</h2>
              <button
                type='button'
                className='rounded-full p-1 hover:bg-zinc-800'
                onClick={closeReport}
              >
                <X className='size-6 text-white/90 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-none' />
              </button>
            </div>
            <div className='relative'>
              <p className='py-2 px-6 text-base'>
                Why are you reporting this account?
              </p>
              <div className='pr-6 pl-2'>
                {MESSAGE_REPORT_CATEGORIES.map(({ id, label }) => (
                  <div
                    key={id}
                    role='button'
                    onClick={() =>
                      setReportData({ category: id, reason: label })
                    }
                    className={cn(
                      'inline-block px-4 py-3 ml-4 mb-4 font-bold text-base leading-[21px] rounded-3xl cursor-pointer',
                      reportData && reportData.category === id
                        ? 'bg-white text-black'
                        : 'bg-white-8 text-white/90'
                    )}
                  >
                    {label}
                  </div>
                ))}
              </div>
              <div className='flex items-center justify-end gap-5 px-6 py-2.5'>
                <Button
                  type='button'
                  className={cn(
                    'select-none relative min-w-[164px] min-h-9 rounded-md text-lg',
                    'leading-[25px] flex-center bg-white-8 hover:bg-white-8 text-white/90 px-2 py-1.5',
                    'box-border font-semibold'
                  )}
                >
                  Cancel
                </Button>
                <Button
                  className={cn(
                    'select-none relative min-w-[164px] min-h-9 rounded-md text-lg leading-[25px]',
                    'flex-center text-white/90 px-2 py-1.5 box-border font-semibold disabled:text-white/35',
                    'disabled:pointer-events-none disabled:bg-white-8 disabled:hover:bg-white-8',
                    'bg-primary-blue hover:bg-primary-blue'
                  )}
                  onClick={handleSubmitReport}
                  disabled={!reportData || loading}
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        modal={true}
      >
        <DialogContent className='p-0 border-none bg-[#121212] text-white/90 overflow-hidden rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.12)] !max-w-md'>
          <ReportConfirmation onClose={() => setShowConfirmation(false)} />
        </DialogContent>
      </Dialog>
    </Fragment>
  );
};

export default MessageReport;
