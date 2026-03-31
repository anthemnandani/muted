import VideoPostsClient from './VideoPostsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Videos',
  description: 'Watch short-form videos from creators on Muted.',
  openGraph: {
    title: 'Videos',
    description: 'Watch short-form videos from creators on Muted.',
    type: 'website',
    url: '/videos',
  },
  twitter: {
    card: 'summary',
    title: 'Videos',
    description: 'Watch short-form videos from creators on Muted.',
  },
};

const VideosFeedPage = () => {
  return <VideoPostsClient />;
};

export default VideosFeedPage;
