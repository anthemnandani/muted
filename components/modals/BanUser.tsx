'use client';

import useUserActions from '@/hooks/useUserActions';
import { ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';

const BanUser = ({
  userId,
  isBanned,
}: {
  userId: string;
  isBanned: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { handleBan, isBanningUser } = useUserActions({ userId });

  const onBanConfirm = () => {
    handleBan();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='hover:bg-white/10'
          title='Ban'
          disabled={isBanned}
        >
          <ShieldAlert className='size-5 text-red-500' />
          <span className='sr-only'>Ban user</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='select-none border-none bg-transparent p-0 shadow-none outline-none z-[1001]'>
        <Card className='rounded-2xl border-none bg-gray-6 shadow-2xl ring-1 ring-gray-7 ring-offset-0'>
          <CardHeader className='items-center text-center'>
            <div className='flex-center mb-4 size-16 rounded-full bg-red-900/50 ring-2 ring-red-500/50'>
              <ShieldAlert className='size-8 text-red-400' />
            </div>
            <CardTitle className='mb-3 text-2xl'>
              Permanently Ban User
            </CardTitle>
            <CardDescription className='text-base text-white/70'>
              Are you sure you want to ban this user? This action is{' '}
              <b className='font-semibold text-red-400'>irreversible</b>.
              <br />
              All of their content will be permanently deleted.
            </CardDescription>
          </CardHeader>
          <CardFooter className='flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
            <Button
              variant='secondary'
              onClick={() => setIsOpen(false)}
              disabled={isBanningUser}
            >
              Cancel
            </Button>
            <Button
              className='bg-red-600 text-white hover:bg-red-700'
              onClick={onBanConfirm}
              disabled={isBanningUser}
            >
              {isBanningUser ? 'Banning...' : 'Confirm Ban'}
            </Button>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default BanUser;
