import FollowersClient from './FollowersClient';

const FollowersPage = ({ params }: { params: { username: string } }) => {
  const { username } = params;
  const cleanedUsername = decodeURIComponent(username).substring(1);
  return <FollowersClient username={cleanedUsername} />;
};

export default FollowersPage;
