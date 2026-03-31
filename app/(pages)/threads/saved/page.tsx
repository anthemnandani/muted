import { Metadata } from 'next';
import SavedThreadsClient from './SavedThreadsClient';

export const metadata: Metadata = {
  title: 'Saved Threads',
  description: 'Your saved threads on Muted.',
};

const SavedThreadsPage = () => {
  return <SavedThreadsClient />;
};

export default SavedThreadsPage;
