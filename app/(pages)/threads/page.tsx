import { Metadata } from 'next';
import ThreadsClient from './ThreadsClient';

export const metadata: Metadata = {
  title: 'Threads',
  description: 'Join conversations and discussions on Muted.',
  openGraph: {
    title: 'Threads',
    description: 'Join conversations and discussions on Muted.',
    type: 'website',
    url: '/threads',
  },
  twitter: {
    card: 'summary',
    title: 'Threads',
    description: 'Join conversations and discussions on Muted.',
  },
};

const ThreadsPage = () => {
  return <ThreadsClient />;
};

export default ThreadsPage;
