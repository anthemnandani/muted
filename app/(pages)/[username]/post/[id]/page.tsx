import PostInfoClient from './PostInfoClient';

const PostInfoPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  return <PostInfoClient id={id} />;
};

export default PostInfoPage;
