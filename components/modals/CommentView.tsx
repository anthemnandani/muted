'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CommentViewProps } from '@/lib/types';
import PostText from '../shared/PostText';
import UserAvatar from '../shared/UserAvatar';
import { Card } from '../ui/card';
import { MessageCircle } from 'lucide-react';

const CommentView = ({
  text,
  author,
  mentions,
  isOpen,
  onOpenChange,
}: CommentViewProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl select-none border-none bg-transparent shadow-none outline-none'>
        <Card className='px-6 py-5 rounded-2xl border-none bg-gray-6 shadow-2xl ring-1 ring-gray-7 ring-offset-0'>
          <UserAvatar
            username={author.username}
            fullname={author?.fullName}
            image={author.image}
            showInfo
          />
          <div className='mt-4'>
            <PostText text={text} mentions={mentions} showMore={false} />
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default CommentView;
