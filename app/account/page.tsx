import AccountSetupForm from '@/components/auth/AccountSetupForm';

const AccountPage = () => {
  return (
    <div className='mx-auto h-[95vh] w-full max-w-lg flex-col-center gap-6'>
      <AccountSetupForm />
    </div>
  );
};

export default AccountPage;
