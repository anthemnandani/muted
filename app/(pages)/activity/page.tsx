import ActivityClient from './ActivityClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Activity',
  description: 'View your recent activity, replies, and interactions on Muted.',
  openGraph: {
    title: 'Activity',
    description: 'View your recent activity on Muted.',
    type: 'website',
    url: '/activity',
  },
  twitter: {
    card: 'summary',
    title: 'Activity',
    description: 'View your recent activity on Muted.',
  },
};

const ActivityPage = () => {
  return <ActivityClient />;
};

export default ActivityPage;
