import TopicFeedClient from './TopicFeedClient';

const TopicFeedPage = ({ params }: { params: { tag: string } }) => {
  return <TopicFeedClient tag={params.tag} />;
};

export default TopicFeedPage;
