'use client';

import { useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import { api } from '@/trpc/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';

const ReactivateDialog = () => {
  const router = useRouter();
  const { signOut } = useClerk();

  const { mutate: reactivate, isLoading } =
    api.user.reactivateAccount.useMutation({
      onSuccess: () => {
        toast.success('Account reactivated successfully');
        window.location.href = '/';
      },
      onError: (error) => {
        toast.error(
          "Couldn't reactivate your account. Please try signing in again."
        );
      },
    });

  const handleCancel = () => {
    signOut(() => router.push('/sign-in'));
  };

  return (
    <Dialog open={true}>
      <DialogContent
        className={cn(
          'p-0 border-none bg-[#121212] text-white/90 overflow-hidden rounded-xl',
          'shadow-[0_2px_12px_rgba(0,0,0,0.12)] !max-w-md'
        )}
      >
        <div className='px-6 py-10 text-center flex flex-col items-center'>
          <h3 className='text-2xl font-bold text-white/90 mb-2'>
            Reactivate your account?
          </h3>
          <p className='text-white/75 mb-8 max-w-sm'>
            Welcome back! Your account is currently deactivated. By
            reactivating, you will restore your profile, posts, and all previous
            activity.
          </p>
          <div className='flex w-full flex-col gap-3 sm:flex-row'>
            <Button
              className='flex-1 text-base bg-white/10 hover:bg-white/20 text-white w-full rounded-lg'
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              className='flex-1 text-base bg-blue-600 hover:bg-blue-700 text-white w-full rounded-lg'
              onClick={() => reactivate()}
              disabled={isLoading}
            >
              {isLoading ? (
                <Icons.spinner className='size-4 animate-spin' />
              ) : (
                'Reactivate'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReactivateDialog;
