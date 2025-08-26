'use client';

import { useSettingRefs } from '@/hooks/useSettingRefs';
import { api } from '@/trpc/react';
import SettingPanel from './components/SettingPanel';
import SettingsLayout from './components/SettingsLayout';

const SettingClient = () => {
  const { data: user, isLoading } = api.user.getMe.useQuery();
  const sectionRefs = useSettingRefs();

  return (
    <SettingsLayout sectionRefs={sectionRefs} isLoading={isLoading}>
      {user && <SettingPanel sectionRefs={sectionRefs} user={user} />}
    </SettingsLayout>
  );
};

export default SettingClient;
