'use client';

import PostInfoClient from '../../post/[id]/PostInfoClient';

const LikedPostInfoClient = ({
  id,
  username,
}: {
  id: string;
  username: string;
}) => {
  return <PostInfoClient id={id} username={username} type='liked' />;
};

export default LikedPostInfoClient;
