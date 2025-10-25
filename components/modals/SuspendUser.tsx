'use client';

import useUserActions from '@/hooks/useUserActions';
import { formatDate } from '@/lib/utils';
import { CalendarIcon, Pause, Play } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

const SuspendUser = ({
  isSuspended,
  userId,
}: {
  isSuspended: boolean;
  userId: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleOpenChange = (isOpen: boolean) => {
    setIsOpen(isOpen);
    if (!isOpen) {
      setTimeout(() => {
        setStep(1);
        setDate(undefined);
        setIsPopoverOpen(false);
      }, 200);
    }
  };

  const {
    handleSuspend,
    handleUnsuspend,
    isSuspendingUser,
    isUnsuspendingUser,
  } = useUserActions({ userId });

  const renderStepOne = () => (
    <Card className='rounded-2xl border-none bg-gray-6 shadow-2xl ring-1 ring-gray-7 ring-offset-0'>
      <CardHeader>
        <CardTitle className='mb-2'>Suspend User</CardTitle>
        <CardDescription className='text-white/65'>
          Select a date until which the user will be suspended.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              className={`w-[280px] flex justify-start items-center text-left font-normal ${
                !date ? 'text-white/60' : 'text-white'
              }`}
              onClick={() => setIsPopoverOpen(true)}
            >
              <CalendarIcon className='mr-2 size-4' />

              <span className='mt-0.5'>
                {date ? formatDate(date) : 'Pick a date'}
              </span>
            </Button>
          </PopoverTrigger>
          {isPopoverOpen && (
            <PopoverContent className='w-auto p-0'>
              <Calendar
                mode='single'
                selected={date}
                onSelect={(selectedDate) => {
                  setDate(selectedDate);
                  setIsPopoverOpen(false);
                }}
                disabled={(date) => date <= today}
                initialFocus
              />
            </PopoverContent>
          )}
        </Popover>
      </CardContent>
      <CardFooter className='flex justify-end gap-2'>
        <Button variant='secondary' onClick={() => handleOpenChange(false)}>
          Cancel
        </Button>
        <Button
          className='bg-yellow-600 text-white/90 hover:bg-yellow-700'
          onClick={() => setStep(2)}
          disabled={!date}
        >
          Next
        </Button>
      </CardFooter>
    </Card>
  );

  const renderStepTwo = () => (
    <Card className='rounded-2xl border-none bg-gray-6 shadow-2xl ring-1 ring-gray-7 ring-offset-0'>
      <CardHeader>
        <CardTitle className='mb-2'>Confirm Suspension</CardTitle>
        <CardDescription className='text-white/65 font-medium'>
          Are you sure you want to suspend this user until{' '}
          <span className='text-white'>{formatDate(date!)}?</span>
          They will be notified.
        </CardDescription>
      </CardHeader>
      <CardFooter className='flex justify-end gap-2'>
        <Button
          variant='secondary'
          onClick={() => setStep(1)}
          disabled={isSuspendingUser}
        >
          Back
        </Button>
        <Button
          className='bg-yellow-600 text-white hover:bg-yellow-700'
          onClick={() => {
            setIsOpen(false);
            handleSuspend(date as Date);
            setStep(1);
            setDate(undefined);
            setIsPopoverOpen(false);
          }}
          disabled={isSuspendingUser}
        >
          {isSuspendingUser ? 'Suspending...' : 'Confirm Suspend'}
        </Button>
      </CardFooter>
    </Card>
  );

  const renderUnsuspendConfirm = () => (
    <Card className='rounded-2xl border-none bg-gray-6 shadow-2xl ring-1 ring-gray-7 ring-offset-0'>
      <CardHeader>
        <CardTitle className='mb-2'>Unsuspend User</CardTitle>
        <CardDescription className='text-white/65 font-medium'>
          Are you sure you want to remove this user's suspension? They will
          regain full access immediately.
        </CardDescription>
      </CardHeader>
      <CardFooter className='flex justify-end gap-2'>
        <Button
          variant='secondary'
          onClick={() => handleOpenChange(false)}
          disabled={isUnsuspendingUser}
        >
          Cancel
        </Button>
        <Button
          className='text-primary-blue hover:text-primary-blue/90 bg-transparent border border-primary-blue hover:bg-primary-blue/10'
          onClick={() => {
            setIsOpen(false);
            handleUnsuspend();
          }}
          disabled={isUnsuspendingUser}
        >
          {isUnsuspendingUser ? 'Unsuspending...' : 'Confirm Unsuspend'}
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='hover:bg-white/10'
          title={isSuspended ? 'Unsuspend' : 'Suspend'}
        >
          {isSuspended ? (
            <Play className='size-5 text-green-500' />
          ) : (
            <Pause className='size-5 text-yellow-500' />
          )}
          <span className='sr-only'>
            {isSuspended ? 'Unsuspend user' : 'Suspend user'}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className='select-none border-none bg-transparent shadow-none outline-none z-[1001]'>
        {isSuspended
          ? renderUnsuspendConfirm()
          : step === 1
          ? renderStepOne()
          : renderStepTwo()}
      </DialogContent>
    </Dialog>
  );
};

export default SuspendUser;
