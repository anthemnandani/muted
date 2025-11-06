'use client';

import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';
import { Role } from '@prisma/client';
import { ShieldCheck, ShieldOff } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import ConfirmDialog from '../modals/ConfirmDialog';
import { Button } from '../ui/button';

const ToggleAdmin = ({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: Role;
}) => {
  const [open, setOpen] = useState(false);

  const isCurrentlyAdmin = currentRole === Role.ADMIN;
  const newRole = isCurrentlyAdmin ? Role.USER : Role.ADMIN;
  const trpcUtils = api.useUtils();

  const title = isCurrentlyAdmin ? 'Remove Admin' : 'Make Admin';
  const description = `Are you sure you want to ${
    isCurrentlyAdmin
      ? 'remove admin privileges from'
      : 'grant admin privileges to'
  } this user?`;

  const { mutateAsync: setRole, isPending } = api.admin.setRole.useMutation({
    onSettled: async () => {
      await trpcUtils.admin.getAllUsers.invalidate();
    },
  });

  const handleToggleAdmin = () => {
    setOpen(false);
    const promise = setRole({ targetUserId: userId, role: newRole });

    toast.promise(promise, {
      loading: 'Processing...',
      success: () =>
        `User has been ${
          isCurrentlyAdmin ? 'demoted as an Admin' : 'promoted to Admin'
        }.`,
      error: 'Error changing user.',
      richColors: true,
    });
  };

  return (
    <ConfirmDialog
      title={title}
      description={description}
      open={open}
      setOpen={setOpen}
      onClick={handleToggleAdmin}
      isLoading={isPending}
      btnTitle={isCurrentlyAdmin ? 'Remove' : 'Confirm'}
      btnClassName={cn(
        !isCurrentlyAdmin ? 'text-primary-blue hover:text-primary-blue/90' : ''
      )}
      trigger={
        <Button
          variant='ghost'
          size='icon'
          title={title}
          className='hover:bg-white/10'
        >
          {isCurrentlyAdmin ? (
            <ShieldOff className='size-5' />
          ) : (
            <ShieldCheck className='size-5' />
          )}
        </Button>
      }
    />
  );
};

export default ToggleAdmin;
