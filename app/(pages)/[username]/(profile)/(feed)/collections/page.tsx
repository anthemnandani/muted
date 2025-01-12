import CollectionsClient from './CollectionsClient';

const CollectionsPage = ({ params }: { params: { username: string } }) => {
  const username = decodeURIComponent(params.username).substring(1);

  return <CollectionsClient username={username} />;
};

export default CollectionsPage;
