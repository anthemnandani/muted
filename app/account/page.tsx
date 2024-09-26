import AccountSetupForm from '@/components/auth/AccountSetupForm';
import { getUsername } from '@/lib/utils';
import { currentUser } from '@clerk/nextjs';

const AccountPage = async () => {
  const user = await currentUser();
  const username = getUsername(user) ?? '';

  return (
    <div className='mx-auto h-[95vh] w-full max-w-lg flex-col-center gap-6'>
      <AccountSetupForm username={username} />
    </div>
  );
};

export default AccountPage;
