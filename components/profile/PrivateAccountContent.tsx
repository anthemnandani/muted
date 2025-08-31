import EmptyState from '../shared/EmptyState';
import { Icons } from '../icons';

const PrivateAccountContent = () => {
  return (
    <div className='flex-center w-full h-full'>
      <div className='flex flex-col items-center text-center'>
        <EmptyState
          icon={<Icons.userLock className='size-11 text-white/90' />}
          title='This account is private'
          description='Follow this account to see their contents and likes.'
        />
      </div>
    </div>
  );
};

export default PrivateAccountContent;
