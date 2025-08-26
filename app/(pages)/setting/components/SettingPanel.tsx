import type { SettingPanelProps } from '@/lib/types';
import { Fragment } from 'react';
import ContentPreferencesSection from './ContentPreferencesSection';
import ManageAccountSection from './ManageAccountSection';
import PrivacySection from './PrivacySection';
import PushNotificationsSection from './PushNotificationsSection';

const SettingPanel: React.FC<SettingPanelProps> = ({ sectionRefs, user }) => {
  return (
    <Fragment>
      <ManageAccountSection sectionRef={sectionRefs['manage-account']} />
      <PrivacySection sectionRef={sectionRefs['privacy']} user={user} />
      <PushNotificationsSection
        sectionRef={sectionRefs['push-notifications']}
      />
      <ContentPreferencesSection
        sectionRef={sectionRefs['content-preferences']}
      />
    </Fragment>
  );
};

export default SettingPanel;
