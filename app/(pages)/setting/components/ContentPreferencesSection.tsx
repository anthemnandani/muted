import { Icons } from '@/components/icons';
import React from 'react';
import SettingRow from './SettingRow';
import SettingSection from './SettingSection';

const ContentPreferencesSection: React.FC<{
  sectionRef: React.RefObject<HTMLDivElement>;
}> = ({ sectionRef }) => (
  <SettingSection
    id='content-preferences'
    sectionRef={sectionRef}
    title='Content preferences'
  >
    <SettingRow
      title='Filter keywords'
      description='When you filter a keyword, you won’t see posts in your selected feeds that contain that word in any titles, or descriptions. Certain keywords can’t be filtered.'
      control={
        <Icons.chevronRight style={{ fill: '#fff', fillOpacity: '0.34' }} />
      }
      isButton
    />
  </SettingSection>
);

export default ContentPreferencesSection;
