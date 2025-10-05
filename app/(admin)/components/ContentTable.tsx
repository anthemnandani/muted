'use client';

import AdminContentTableSkeleton from '@/components/skeletons/AdminContentTableSkeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import useDebounce from '@/hooks/useDebounce';
import {
  formatCount,
  getContentType,
  getContentTypeBadgeClass,
  getPostThumbnail,
} from '@/lib/utils';
import { useContentFiltesrStore } from '@/store/contentFilters';
import { api } from '@/trpc/react';
import { PostStatus } from '@prisma/client';
import { Heart, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import InfiniteScroll from 'react-infinite-scroll-component';
import ContentTableLoader from './ContentTableLoader';
import PostActions from './PostActions';

const ContentTable = () => {
  const { search, type, status } = useContentFiltesrStore();

  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, hasNextPage, fetchNextPage } =
    api.admin.getAllPosts.useInfiniteQuery(
      { search: debouncedSearch, type, status },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        refetchOnWindowFocus: false,
      }
    );

  const posts = data?.pages.flatMap((page) => page.posts);

  if (isLoading) {
    return <AdminContentTableSkeleton />;
  }

  return (
    <div
      className='relative h-[75vh] rounded-lg border overflow-y-auto'
      id='scrollableTableContainer'
    >
      <InfiniteScroll
        dataLength={posts?.length ?? 0}
        next={fetchNextPage}
        hasMore={hasNextPage ?? false}
        scrollableTarget='scrollableTableContainer'
        loader={<ContentTableLoader />}
      >
        <Table>
          <TableHeader className='sticky top-0 z-10 bg-muted/50 backdrop-blur supports-[backdrop-filter]:bg-muted/40'>
            <TableRow>
              <TableHead className='w-[27%]'>Content Preview</TableHead>
              <TableHead className='w-[18%]'>Author</TableHead>
              <TableHead>Content Type</TableHead>
              <TableHead>Metrics</TableHead>
              <TableHead>Date Created</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {!isLoading && posts?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className='py-10 text-center text-sm text-muted-foreground'
                >
                  No content matches your filters.
                </TableCell>
              </TableRow>
            ) : (
              posts?.map((post) => {
                const contentType = getContentType(post);
                return (
                  <TableRow
                    key={post.id}
                    className='bg-transparent hover:bg-muted/30'
                  >
                    <TableCell>
                      <button className='group flex w-full items-center gap-3 text-left'>
                        {post.threadText ? (
                          <div className='line-clamp-1 text-sm text-white/75 text-ellipsis'>
                            {post.threadText}
                          </div>
                        ) : (
                          <img
                            src={getPostThumbnail(post.media?.[0])}
                            alt='Post media preview'
                            loading='lazy'
                            width={96}
                            height={96}
                            className='rounded-md object-cover ring-1 ring-border'
                          />
                        )}
                      </button>
                    </TableCell>

                    <TableCell>
                      <Link
                        href={`/@${post.author.username}`}
                        className='inline-flex items-center gap-2'
                      >
                        <Avatar className='size-7'>
                          <AvatarImage
                            src={post.author.image ?? ''}
                            alt={post.author.username}
                          />
                          <AvatarFallback>
                            {post.author?.fullName?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className='leading-tight'>
                          <p className='line-clamp-1 break-words truncate font-semibold text-sm text-white/90'>
                            {post?.author?.fullName}
                          </p>
                          <p className='text-ellipsis line-clamp-1 break-words text-white/50'>
                            @{post.author.username}
                          </p>
                        </div>
                      </Link>
                    </TableCell>

                    <TableCell className='text-sm capitalize text-white/60'>
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
                          <span className='sr-only'>likes</span>
                        </div>
                        <span className='inline-flex items-center gap-1.5'>
                          <MessageCircle
                            className='size-4 text-white'
                            fill='white'
                            aria-hidden
                          />
                          <span className='font-medium text-white/45'>
                            {formatCount(post.repliesCount)}
                          </span>
                          <span className='sr-only'>comments</span>
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className='text-sm text-white/60'>
                      {new Date(post.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          post.status === PostStatus.VISIBLE
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {post.status === PostStatus.VISIBLE
                          ? 'Visible'
                          : 'Hidden'}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <PostActions id={post.id} status={post.status} />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </InfiniteScroll>
    </div>
  );
};

export default ContentTable;
