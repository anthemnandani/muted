import { Metadata } from 'next';
import FollowingClient from './FollowingClient';

export const metadata: Metadata = {
  title: 'Following',
  description: 'Posts from people you follow on Muted.',
  openGraph: {
    title: 'Following',
    description: 'Posts from people you follow on Muted.',
    type: 'website',
    url: '/following',
  },
  twitter: {
    card: 'summary',
    title: 'Following',
    description: 'Posts from people you follow on Muted.',
  },
};

const FollowingPage = () => {
  return <FollowingClient />;
};

export default FollowingPage;
