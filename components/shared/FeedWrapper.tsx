'use client';

import Loading from '@/app/(pages)/loading';
import Error from '@/app/error';
import CreateWithInput from '@/components/inputs/CreateWithInput';
import ThreadFilterMenu from '@/components/menus/ThreadFilterMenu';
import HeaderWrapper from '@/components/shared/HeaderWrapper';
import ThreadsList from '@/components/shared/ThreadsList';
import Wrapper from '@/components/shared/Wrapper';
import useWindow from '@/hooks/useWindow';
import { ParentPostProps, ThreadFilter } from '@/lib/types';
import useDialog from '@/store/dialog';

interface FeedWrapperProps {
  posts?: ParentPostProps[];
  isLoading: boolean;
  isError: boolean;
  hasNextPage?: boolean;
  fetchNextPage?: any;
  selectedFilter?: ThreadFilter;
  emptyStateMessage: string | React.ReactNode;
}

const FeedWrapper = ({
  posts,
  isLoading,
  isError,
  hasNextPage,
  fetchNextPage,
  selectedFilter,
  emptyStateMessage,
}: FeedWrapperProps) => {
  const { setOpenDialog } = useDialog();
  const { isMobile } = useWindow();

  if (isLoading) return <Loading />;
  if (isError) return <Error />;

  return (
    <>
      {!isMobile && (
        <HeaderWrapper>
          <ThreadFilterMenu selectedFilter={selectedFilter} />
        </HeaderWrapper>
      )}
      <Wrapper>
        {!posts || posts.length === 0 ? (
          <div className='flex items-center justify-center w-full h-screen'>
            <p className='text-gray-3'>{emptyStateMessage}</p>
          </div>
        ) : (
          <>
            <div className='w-full md:flex hidden'>
              <CreateWithInput onClick={() => setOpenDialog(true)} />
            </div>
            <section className='flex flex-col gap-4 justify-start w-full'>
              <ThreadsList
                posts={posts}
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
              />
            </section>
          </>
        )}
      </Wrapper>
    </>
  );
};

export default FeedWrapper;
