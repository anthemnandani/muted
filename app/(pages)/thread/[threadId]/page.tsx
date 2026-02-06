import ThreadInfoClient from './ThreadInfoClient';

const ThreadInfoPage = ({ params }: { params: { threadId: string } }) => {
  const { threadId } = params;
  return <ThreadInfoClient id={threadId} />;
};

export default ThreadInfoPage;
