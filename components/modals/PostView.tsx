'use client';

import UserAvatar from '@/components/shared/UserAvatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { type AdminPost } from '@/lib/types';
import PostMediaCarousel from '../posts/PostMediaCarousel';
import { cn } from '@/lib/utils';

interface PostViewProps {
  post: AdminPost;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const PostView: React.FC<PostViewProps> = ({ post, isOpen, onOpenChange }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'max-w-4xl max-h-[75vh] h-full flex flex-col justify-center p-0 gap-0 rounded-2xl',
          'shadow-2xl overflow-hidden'
        )}
      >
        <PostMediaCarousel
          media={post.media}
          author={post.author}
          createdAt={post.createdAt}
          postId={post.id}
          text={post.text}
          pinned={post.pinned}
          hideLikes={post.hideLikes}
          reposts={[]}
          turnOffComments={post.turnOffComments}
          isAdminPanel
        />
      </DialogContent>
    </Dialog>
  );
};

export default PostView;
