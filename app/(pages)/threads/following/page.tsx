import { ThreadFilter } from '@/lib/types';
import ThreadsClient from '../ThreadsClient';

const FollowingThreadsPage = () => {
  return <ThreadsClient filter={ThreadFilter.FOLLOWING} />;
};

export default FollowingThreadsPage;
