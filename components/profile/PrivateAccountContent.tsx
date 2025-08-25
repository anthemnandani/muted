import EmptyState from '../shared/EmptyState';
import { Icons } from '../icons';

const PrivateAccountContent = () => {
  return (
    <div className='main-container'>
      <div className='flex flex-col flex-[1_1_auto]'>
        <div className='flex-col-center w-full h-full'>
          <EmptyState
            icon={<Icons.userLock className='size-11 text-white/90' />}
            title='This account is private'
            description='Follow this account to see their contents and likes.'
          />
        </div>
      </div>
    </div>
  );
};

export default PrivateAccountContent;
