import { useNotificationStore } from '@/store/notificationStore';
import { Icons } from '../icons';

const FollowRequestsLink: React.FC<{ count: number }> = ({ count }) => {
  const { setMode } = useNotificationStore();
  return (
    <div
      role='button'
      className='flex-between text-sm py-2 pl-3 pr-4 mb-2'
      onClick={() => setMode('FOLLOW_REQUESTS')}
    >
      <h4 className='text-white/90 font-bold'>Follow requests</h4>
      <span className='flex items-center'>
        <i className='size-2 rounded-lg mr-2 bg-primary-blue'></i>
        <span className='text-white/50 mr-2'>{count}</span>
        <Icons.chevronRight className='size-3' fill='#ffffff80' />
      </span>
    </div>
  );
};

export default FollowRequestsLink;
