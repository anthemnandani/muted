import { ThreadFilter } from '@/lib/types';
import ThreadsClient from '../ThreadsClient';

const LikedThreadsPage = () => {
  return <ThreadsClient filter={ThreadFilter.LIKED} />;
};

export default LikedThreadsPage;
