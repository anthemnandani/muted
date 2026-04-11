import { INTERACTIONS_DATA } from '@/lib/constants';
import type {
  ActivityComment,
  ActivityPost,
  ActivityThreadComment,
  ThreadProps,
} from '@/lib/types';
import ActivityCommentRow from './ActivityCommentRow';
import ActivityThreadCommentRow from './ActivityThreadCommentRow';
import PostGridItem from './PostGridItem';
import ThreadListItem from './ThreadListItem';

const InteractionsList = ({
  type,
  items,
}: {
  type: INTERACTIONS_DATA;
  items:
    | ActivityPost[]
    | ThreadProps[]
    | ActivityComment[]
    | ActivityThreadComment[];
}) => {
  if (type === INTERACTIONS_DATA.POST_GRID) {
    return (
      <div className='grid grid-cols-3 gap-1'>
        {items.map((post) => (
          <PostGridItem key={post.id} post={post as ActivityPost} />
        ))}
      </div>
    );
  }

  if (type === INTERACTIONS_DATA.THREAD_LIST) {
    return (
      <div className='flex flex-col gap-4 px-2'>
        {items.map((thread) => (
          <ThreadListItem thread={thread as ThreadProps} />
        ))}
      </div>
    );
  }

  if (type === INTERACTIONS_DATA.POST_COMMENTS) {
    return items.map((comment) => (
      <ActivityCommentRow
        key={comment.id}
        comment={comment as ActivityComment}
      />
    ));
  }

  return items.map((reply) => (
    <ActivityThreadCommentRow
      key={reply.id}
      reply={reply as ActivityThreadComment}
    />
  ));
};

export default InteractionsList;
