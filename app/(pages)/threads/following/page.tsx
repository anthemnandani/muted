import { Metadata } from 'next';
import FollowingThreadsClient from './FollowingThreadsClient';

export const metadata: Metadata = {
  title: 'Following Threads',
  description: 'Threads from people you follow on Muted.',
};

const FollowingThreadsPage = () => {
  return <FollowingThreadsClient />;
};

export default FollowingThreadsPage;
