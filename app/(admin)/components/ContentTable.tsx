'use client';

import PostView from '@/components/modals/PostView';
import UserAvatar from '@/components/shared/UserAvatar';
import AdminContentTableSkeleton from '@/components/skeletons/AdminContentTableSkeleton';
import { Badge } from '@/components/ui/badge';
import {
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import useDebounce from '@/hooks/useDebounce';
import { type AdminPost } from '@/lib/types';
import {
  formatCount,
  getContentType,
  getContentTypeBadgeClass,
  getPostThumbnail,
} from '@/lib/utils';
import { useAdminFiltersStore } from '@/store/adminFiltersStore';
import { api } from '@/trpc/react';
import { PostStatus } from '@prisma/client';
import { Heart, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import AdminItemsTable from './AdminItemsTable';
import PostActions from './PostActions';

const ContentTable = () => {
  const { postSearch, postType, postStatus } = useAdminFiltersStore();
  const debouncedSearch = useDebounce(postSearch, 500);
  const [selectedPost, setSelectedPost] = useState<AdminPost | null>(null);

  const { data, isLoading, hasNextPage, fetchNextPage } =
    api.admin.getAllPosts.useInfiniteQuery(
      { search: debouncedSearch, type: postType, status: postStatus },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        refetchOnWindowFocus: false,
        cacheTime: 10 * 60 * 1000,
        staleTime: 10 * 60 * 1000,
        retry: false,
      }
    );

  const posts = data?.pages.flatMap((page) => page.posts);

  const tableHeader = (
    <TableHeader className='sticky top-0 z-10 bg-muted/50 backdrop-blur supports-[backdrop-filter]:bg-muted/40'>
      <TableRow>
        <TableHead className='w-[27%] pl-6'>Content Preview</TableHead>
        <TableHead className='w-[18%]'>Author</TableHead>
        <TableHead>Content Type</TableHead>
        <TableHead>Metrics</TableHead>
        <TableHead>Date Created</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className='text-center pr-6'>Actions</TableHead>
      </TableRow>
    </TableHeader>
  );

  const renderRow = (post: AdminPost) => {
    const contentType = getContentType(post);
    return (
      <TableRow key={post.id} className='bg-transparent hover:bg-muted/30'>
        <TableCell>
          <button onClick={() => setSelectedPost(post)}>
            <img
              src={getPostThumbnail(post.media?.[0])}
              alt='Post media preview'
              loading='lazy'
              width={96}
              height={96}
              className='rounded-md object-cover ring-1 ring-border'
            />
          </button>
        </TableCell>
        <TableCell>
          <UserAvatar
            username={post.author.username}
            fullname={post.author?.fullName}
            image={post.author.image}
            showInfo
          />
        </TableCell>
        <TableCell className='text-sm capitalize text-white/65'>
          <Badge className={getContentTypeBadgeClass(contentType!)}>
            {contentType}
          </Badge>
        </TableCell>
        <TableCell>
          <div className='flex items-center gap-4 text-sm'>
            <div className='inline-flex items-center gap-1.5'>
              <Heart className='size-4 text-white' fill='white' />
              <span className='font-medium text-white/45'>
                {formatCount(post.likesCount)}
              </span>
            </div>
            <span className='inline-flex items-center gap-1.5'>
              <MessageCircle className='size-4 text-white' fill='white' />
              <span className='font-medium text-white/45'>
                {formatCount(post.repliesCount)}
              </span>
            </span>
          </div>
        </TableCell>
        <TableCell className='text-sm text-white/65'>
          {new Date(post.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </TableCell>
        <TableCell>
          <Badge
            variant={
              post.status === PostStatus.VISIBLE ? 'default' : 'secondary'
            }
          >
            {post.status === PostStatus.VISIBLE ? 'Visible' : 'Hidden'}
          </Badge>
        </TableCell>
        <TableCell>
          <PostActions
            id={post.id}
            userId={post.author.id}
            status={post.status}
          />
        </TableCell>
      </TableRow>
    );
  };

  return (
    <AdminItemsTable
      items={posts}
      isLoading={isLoading}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      skeleton={<AdminContentTableSkeleton />}
      tableHeader={tableHeader}
      renderRow={renderRow}
      emptyStateMessage='No content matches your filters.'
      colSpan={7}
    >
      {selectedPost && (
        <PostView
          post={selectedPost}
          isOpen={!!selectedPost}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setSelectedPost(null);
            }
          }}
        />
      )}
    </AdminItemsTable>
  );
};

export default ContentTable;
