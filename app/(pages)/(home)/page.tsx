import { Metadata } from 'next';
import HomeFeedClient from './HomeFeedClient';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Discover posts, photos, and videos on Muted',
};

const HomePage = () => {
  return <HomeFeedClient />;
};

export default HomePage;
