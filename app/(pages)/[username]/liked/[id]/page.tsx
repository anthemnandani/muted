import LikedPostInfoClient from './LikedPostInfoClient';

export default function LikedPostPage({
  params,
}: {
  params: { username: string; id: string };
}) {
  const username = decodeURIComponent(params.username).substring(1);

  return <LikedPostInfoClient username={username} id={params.id} />;
}
