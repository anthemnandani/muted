import { ThreadFilter } from '@/lib/types';
import ThreadsClient from '../ThreadsClient';

const SavedThreadsPage = () => {
  return <ThreadsClient filter={ThreadFilter.SAVED} />;
};

export default SavedThreadsPage;
