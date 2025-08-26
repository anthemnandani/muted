'use client';

import { useSettingRefs } from '@/hooks/useSettingRefs';
import SettingsLayout from '../components/SettingsLayout';
import BlockList from '../components/BlockList';
import { api } from '@/trpc/react';
import { useBlockedUsers } from '@/store/blockedUsers';
import { useEffect } from 'react';

const BlockListClient = () => {
  const sectionRefs = useSettingRefs();

  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.user.getBlockedUsers.useInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        refetchOnWindowFocus: false,
      }
    );

  const allBlockedUsers = data?.pages.flatMap((page) => page.blockedUsers);

  const setInitialBlockedUsers = useBlockedUsers(
    (state) => state.setInitialBlockedUsers
  );

  useEffect(() => {
    if (allBlockedUsers) {
      const userIds = allBlockedUsers.map((user) => user.id);
      setInitialBlockedUsers(userIds);
    }
  }, [allBlockedUsers, setInitialBlockedUsers]);

  return (
    <SettingsLayout
      sectionRefs={sectionRefs}
      isLoading={isLoading}
      isBlockOrMutePage
    >
      <BlockList
        allBlockedUsers={allBlockedUsers}
        isError={isError}
        hasNextPage={!!hasNextPage}
        fetchNextPage={fetchNextPage}
      />
    </SettingsLayout>
  );
};

export default BlockListClient;
