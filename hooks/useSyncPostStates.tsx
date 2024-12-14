import { useHiddenPosts } from '@/store/hiddenPosts';
import { useMutedUsers } from '@/store/mutedUsers';

export const useSyncPostStates = () => {
  const { muteUser, unmuteUser } = useMutedUsers();
  const { hidePost, unhidePost } = useHiddenPosts();

  const syncPostStates = (post: any) => {
    if (!post) return;

    post.isMuted ? muteUser(post.author.id) : unmuteUser(post.author.id);
    post.isHidden ? hidePost(post.id) : unhidePost(post.id);
  };

  const syncPostAndParent = (post: any) => {
    post.parentPost && syncPostStates(post.parentPost);
    syncPostStates(post);
  };

  const syncFirstPost = (posts: any[]) => {
    posts?.[0] && syncPostStates(posts[0]);
  };

  const syncMultiplePosts = (posts: any[]) => {
    posts?.forEach(syncPostStates);
  };

  return {
    syncPostStates,
    syncPostAndParent,
    syncFirstPost,
    syncMultiplePosts,
  };
};
