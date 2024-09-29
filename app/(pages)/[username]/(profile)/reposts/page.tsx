import RepostsClient from './RepostsClient';

const RepostsPage = ({ params }: { params: { username: string } }) => {
  const username = decodeURIComponent(params.username).substring(1);

  return <RepostsClient username={username} />;
};

export default RepostsPage;
