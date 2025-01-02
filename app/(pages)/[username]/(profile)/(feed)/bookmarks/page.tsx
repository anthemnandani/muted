import BookmarksClient from './BookmarksClient';

const BookmarksPage = ({ params }: { params: { username: string } }) => {
  const username = decodeURIComponent(params.username).substring(1);

  return <BookmarksClient username={username} />;
};

export default BookmarksPage;
