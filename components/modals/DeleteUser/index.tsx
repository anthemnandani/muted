'use client';

import { Icons } from '@/components/icons';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DELETE_USER_POINTS } from '@/lib/constants';
import { cn, formatEmail } from '@/lib/utils';
import { DialogTitle } from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Fragment } from 'react';
import DeleteUserFooter from './DeleteUserFooter';
import DeleteUserHeader from './DeleteUserHeader';
import useDeleteUser from '@/hooks/useDeleteUser';
import { useUser } from '@clerk/nextjs';

const DeleteUser = () => {
  const { user } = useUser();
  const {
    isOpen,
    setIsOpen,
    step,
    setStep,
    otp,
    setOtp,
    resendCooldown,
    isVerifying,
    isLoading,
    handleRequestCode,
    handleVerifyAndDelete,
  } = useDeleteUser();
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} modal={true}>
      <DialogContent
        className={cn(
          'p-0 border-none bg-[#121212] text-white/90 overflow-hidden rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.12)]',
          'flex flex-col !max-w-[700px] w-[700px] max-h-[660px] h-[calc(-64px_+_100vh)]'
        )}
      >
        <DialogHeader>
          <DialogTitle>
            <VisuallyHidden.Root>Delete User</VisuallyHidden.Root>
          </DialogTitle>
        </DialogHeader>
        {step === 'info' && (
          <Fragment>
            <DeleteUserHeader
              title={`${user?.username}: delete this account?`}
            />
            <ScrollArea className='flex-1 w-full'>
              <div className='max-h-[660px] pt-5 px-8 mb-14'>
                <div className='text-[15px] leading-[20px] text-white/75 pb-4'>
                  <span>Your account will be deactivated for </span>
                  <b>30 days</b>
                  <span>
                    {' '}
                    and won’t be visible to the public. During deactivation, you
                    can reactive your Muted account anytime.{' '}
                  </span>
                  <span>After </span>
                  <b>30 days</b>
                  <span>
                    , your account and data will be deleted permanently.
                  </span>
                </div>
                <div className='text-[15px] leading-[20px] text-white/75 pb-2'>
                  If you delete your account:
                </div>
                <ul className='list-disc pl-4 mt-2 mb-4 space-y-2 text-white/75'>
                  {DELETE_USER_POINTS.map((item) => (
                    <li key={item.id}>{item.text}</li>
                  ))}
                </ul>
                <div className='text-[15px] leading-[20px] text-white/75'>
                  Do you want to continue?
                </div>
              </div>
            </ScrollArea>
            <DeleteUserFooter
              btnTitle='Continue'
              onClick={handleRequestCode}
              isLoading={isLoading}
            />
          </Fragment>
        )}
        {step === 'action' && (
          <Fragment>
            <DeleteUserHeader
              title='Help us confirm it’s you'
              icon={
                <Icons.chevronLeft
                  className='size-6 text-white/90 cursor-pointer'
                  onClick={() => setStep('info')}
                />
              }
            />
            <ScrollArea className='flex-1 w-full'>
              <div className='max-h-[660px] pt-5 px-12 mb-14'>
                <div className='text-[15px] leading-[20px] text-white/75 pb-6'>
                  To delete {user?.username}, enter the code we sent to your
                  email{' '}
                  {formatEmail(user?.emailAddresses[0].emailAddress as string)}
                </div>
                <div className='flex flex-col items-center gap-3'>
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                    className='gap-3'
                  >
                    <InputOTPGroup className='gap-3'>
                      {Array.from({ length: 6 }).map((_, index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className={cn(
                            'size-14 text-xl font-semibold bg-[#1a1a1a] border-[#333] text-white/90',
                            'focus:border-white/50 focus:ring-1 focus:ring-white/20 rounded-lg transition-all duration-200'
                          )}
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                  <div className='text-center mt-4'>
                    <button
                      type='button'
                      onClick={() => handleRequestCode(true)}
                      disabled={isLoading}
                      className={cn(
                        'text-sm text-white/50 hover:text-white/75 hover:underline',
                        'transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                      )}
                    >
                      {resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : "Didn't receive the code? Resend"}
                    </button>
                  </div>
                </div>
              </div>
            </ScrollArea>
            <DeleteUserFooter
              btnTitle='Delete account'
              onClick={handleVerifyAndDelete}
              isLoading={isVerifying}
              onCancel={() => setIsOpen(false)}
            />
          </Fragment>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUser;
