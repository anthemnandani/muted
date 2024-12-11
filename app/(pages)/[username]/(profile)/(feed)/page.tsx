import ProfileClient from './ProfileClient';

const ProfilePage = ({ params }: { params: { username: string } }) => {
  const username = decodeURIComponent(params.username).substring(1);

  return <ProfileClient username={username} />;
};

export default ProfilePage;
