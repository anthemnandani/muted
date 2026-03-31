import { Metadata } from 'next';
import MessagesClient from './MessagesClient';

export const metadata: Metadata = {
  title: 'Messages',
  description: 'Chat with your connections and manage conversations on Muted.',
  openGraph: {
    title: 'Messages',
    description: 'Chat with your connections on Muted.',
    type: 'website',
  },
};

const MessagesPage = () => {
  return <MessagesClient />;
};

export default MessagesPage;
