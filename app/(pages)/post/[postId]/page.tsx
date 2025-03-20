import PostDetailsClient from './PostDetailsClient';

const PostDetails = ({ params }: { params: { postId: string } }) => {
  return <PostDetailsClient postId={params.postId} />;
};

export default PostDetails;
