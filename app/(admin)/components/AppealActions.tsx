'use client';

import ConfirmDialog from '@/components/modals/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { AppealStatus } from '@/generated/prisma/enums';
import { api } from '@/trpc/react';
import { Check, Loader2, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const AppealActions = ({
  appealId,
  status,
}: {
  appealId: string;
  status: AppealStatus;
}) => {
  const [upholdOpen, setUpholdOpen] = useState(false);
  const [overturnOpen, setOverturnOpen] = useState(false);

  const trpcUtils = api.useUtils();
  const { mutate: reviewAppeal, isPending } =
    api.admin.reviewAppeal.useMutation({
      onSuccess: () => {
        toast.success('Appeal reviewed successfully.');
        setUpholdOpen(false);
        setOverturnOpen(false);
      },
      onError: (err) => {
        toast.error(err.message);
        setUpholdOpen(false);
        setOverturnOpen(false);
      },
      onSettled: () => {
        trpcUtils.admin.getAppeals.invalidate();
      },
    });

  const handleReview = (decision: 'UPHELD' | 'OVERTURNED') => {
    reviewAppeal({ appealId, decision });
  };

  if (status !== AppealStatus.PENDING) {
    return (
      <p className='text-sm text-center text-white/50 font-semibold'>
        Reviewed
      </p>
    );
  }

  return (
    <div className='flex-center gap-1'>
      <ConfirmDialog
        open={upholdOpen}
        setOpen={setUpholdOpen}
        title='Uphold Appeal'
        description="This will deny the user's appeal and their suspension will continue. This action cannot be undone."
        btnTitle='Uphold'
        isLoading={isPending}
        onClick={() => handleReview('UPHELD')}
        trigger={
          <Button
            variant='ghost'
            size='icon'
            className='hover:bg-primary-red/10'
            title='Uphold (Deny)'
            disabled={isPending}
          >
            {isPending && !overturnOpen ? (
              <Loader2 className='size-5 animate-spin' />
            ) : (
              <X className='size-5 text-primary-red' />
            )}
          </Button>
        }
      />

      <ConfirmDialog
        open={overturnOpen}
        setOpen={setOverturnOpen}
        title='Overturn Appeal'
        description="This will approve the user's appeal. The system will then lift their suspension (if no other suspensions are active)."
        btnTitle='Overturn'
        btnClassName='text-green-500 hover:text-green-500/75'
        isLoading={isPending}
        onClick={() => handleReview('OVERTURNED')}
        trigger={
          <Button
            variant='ghost'
            size='icon'
            className='hover:bg-green-500/10'
            title='Overturn (Approve)'
            disabled={isPending}
          >
            {isPending && !upholdOpen ? (
              <Loader2 className='size-5 animate-spin' />
            ) : (
              <Check className='size-5 text-green-500' />
            )}
          </Button>
        }
      />
    </div>
  );
};

export default AppealActions;
