import FollowingClient from './FollowingClient';

const FollowingPage = ({ params }: { params: { username: string } }) => {
  const { username } = params;
  const cleanedUsername = decodeURIComponent(username).substring(1);
  return <FollowingClient username={cleanedUsername} />;
};

export default FollowingPage;
