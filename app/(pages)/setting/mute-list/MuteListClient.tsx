'use client';

import { useSettingRefs } from '@/hooks/useSettingRefs';
import { useMutedUsers } from '@/store/mutedUsers';
import { api } from '@/trpc/react';
import { useEffect } from 'react';
import MuteList from '../components/MuteList';
import SettingsLayout from '../components/SettingsLayout';

const MuteListClient = () => {
  const sectionRefs = useSettingRefs();

  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.user.getMutedUsers.useInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        refetchOnWindowFocus: false,
      }
    );

  const allMutedUsers = data?.pages.flatMap((page) => page.mutedUsers);

  const setInitialMutedUsers = useMutedUsers(
    (state) => state.setInitialMutedUsers
  );

  useEffect(() => {
    if (allMutedUsers) {
      const userIds = allMutedUsers.map((user) => user.id);
      setInitialMutedUsers(userIds);
    }
  }, [allMutedUsers, setInitialMutedUsers]);

  return (
    <SettingsLayout sectionRefs={sectionRefs} isLoading={isLoading}>
      <MuteList
        allMutedUsers={allMutedUsers}
        isError={isError}
        hasNextPage={!!hasNextPage}
        fetchNextPage={fetchNextPage}
      />
    </SettingsLayout>
  );
};

export default MuteListClient;
