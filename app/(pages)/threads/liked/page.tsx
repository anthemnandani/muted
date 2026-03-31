import { Metadata } from 'next';
import LikedThreadsClient from './LikedThreadsClient';

export const metadata: Metadata = {
  title: 'Liked Threads',
  description: 'Threads you have liked on Muted.',
};

const LikedThreadsPage = () => {
  return <LikedThreadsClient />;
};

export default LikedThreadsPage;
