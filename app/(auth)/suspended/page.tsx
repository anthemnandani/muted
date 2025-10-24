const SuspendedPage = () => {
  return (
    <div className='flex-center h-screen text-white/90'>
      <div className='text-center p-8'>
        <h1 className='text-3xl font-bold text-red-500 mb-4'>
          Account Suspended
        </h1>
        <p className='text-lg text-gray-300'>
          Your account is currently suspended.
        </p>
        <p className='text-md text-gray-400 mt-2'>
          Please check your notifications for more details.
        </p>
      </div>
    </div>
  );
};

export default SuspendedPage;
