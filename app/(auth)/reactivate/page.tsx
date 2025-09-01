import ReactivateDialog from '@/components/modals/ReactivateDialog';
import { db } from '@/server/db';
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

const ReactivatePage = async () => {
  const user = await currentUser();

  if (!user) redirect('/sign-in');

  const dbUser = await db.user.findUnique({
    where: {
      id: user?.id,
    },
    select: {
      deactivated: true,
    },
  });

  if (!dbUser?.deactivated) redirect('/');

  return <ReactivateDialog />;
};

export default ReactivatePage;
