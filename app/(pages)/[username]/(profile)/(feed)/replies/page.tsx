import RepliesClient from './RepliesClient';

const RepliesPage = ({ params }: { params: { username: string } }) => {
  const username = decodeURIComponent(params.username).substring(1);

  return <RepliesClient username={username} />;
};

export default RepliesPage;
