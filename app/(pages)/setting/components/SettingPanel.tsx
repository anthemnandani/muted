import type { SettingPanelProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import ContentPreferencesSection from './ContentPreferencesSection';
import ManageAccountSection from './ManageAccountSection';
import PrivacySection from './PrivacySection';
import PushNotificationsSection from './PushNotificationsSection';

const SettingPanel: React.FC<SettingPanelProps> = ({ sectionRefs, user }) => {
  return (
    <div
      className={cn(
        'bg-gray-6 shadow-setting-panel rounded-t-lg flex-[0_0_728px]',
        'box-border pt-4 pb-6 px-6 overflow-y-auto hide-scrollbar'
      )}
    >
      <ManageAccountSection sectionRef={sectionRefs['manage-account']} />
      <PrivacySection sectionRef={sectionRefs['privacy']} user={user} />
      <PushNotificationsSection
        sectionRef={sectionRefs['push-notifications']}
      />
      <ContentPreferencesSection
        sectionRef={sectionRefs['content-preferences']}
      />
    </div>
  );
};

export default SettingPanel;
