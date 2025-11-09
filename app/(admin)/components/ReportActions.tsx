'use client';

import ConfirmDialog from '@/components/modals/ConfirmDialog';
import IssueStrike from '@/components/modals/IssueStrike';
import { Button } from '@/components/ui/button';
import type { AdminReport } from '@/lib/types';
import { api } from '@/trpc/react';
import { ReportStatus } from '@prisma/client';
import { Check, ShieldAlert, X } from 'lucide-react';
import { Fragment, useState } from 'react';
import { toast } from 'sonner';

const ReportActions = ({ report }: { report: AdminReport }) => {
  const [isDismissOpen, setIsDismissOpen] = useState(false);
  const { id, post, userId, status } = report;

  const trpcUtils = api.useUtils();

  const { mutateAsync: dismissReport, isPending: isDismissing } =
    api.admin.dismissReport.useMutation({
      onSettled: async () => {
        await trpcUtils.admin.getAllReports.invalidate();
      },
    });

  const handleDismiss = () => {
    setIsDismissOpen(false);
    const promise = dismissReport({ id: report.id });

    toast.promise(promise, {
      loading: 'Dismissing report...',
      success: 'Report dismissed.',
      error: (err) => err.message || 'Error dismissing report.',
      richColors: true,
    });
  };

  return (
    <div className='flex-center gap-1'>
      {status === ReportStatus.PENDING && (
        <Fragment>
          <IssueStrike
            userId={(userId || post?.author?.id) as string}
            postId={post?.id}
            reportId={id}
          />
          <ConfirmDialog
            open={isDismissOpen}
            setOpen={(value) => setIsDismissOpen(value)}
            title='Dismiss Report'
            description='This report will be marked as "Dismissed" and no action will be taken. Are you sure?'
            btnTitle='Confirm Dismiss'
            btnClassName='text-primary-blue hover:text-primary-blue/75'
            isLoading={isDismissing}
            onClick={handleDismiss}
            trigger={
              <Button
                variant='ghost'
                size='icon'
                className='hover:bg-white/10'
                title='Dismiss'
              >
                <X className='size-5 text-green-500' />
                <span className='sr-only'>Dismiss Report</span>
              </Button>
            }
          />
        </Fragment>
      )}

      {status === ReportStatus.ACTIONED && (
        <div
          className='flex-center gap-1.5 text-xs text-red-500'
          title='Action Taken'
        >
          <ShieldAlert className='size-4' />
          <span>Actioned</span>
        </div>
      )}
      {status === ReportStatus.DISMISSED && (
        <div
          className='flex-center gap-1.5 text-xs text-green-500'
          title='Report Dismissed'
        >
          <Check className='size-4' />
          <span>Dismissed</span>
        </div>
      )}
    </div>
  );
};

export default ReportActions;
