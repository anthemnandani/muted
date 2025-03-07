import PostInfoClient from './PostInfoClient';

export default function ProfilePostPage({
  params,
}: {
  params: { username: string; id: string };
}) {
  const username = decodeURIComponent(params.username).substring(1);

  return <PostInfoClient username={username} id={params.id} />;
}
