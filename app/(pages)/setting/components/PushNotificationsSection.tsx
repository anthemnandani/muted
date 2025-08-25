import { Icons } from '@/components/icons';
import { Switch } from '@/components/ui/switch';
import { Fragment, useState } from 'react';
import SettingSection from './SettingSection';

const PushNotificationsSection: React.FC<{
  sectionRef: React.RefObject<HTMLDivElement>;
}> = ({ sectionRef }) => {
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);

  const notificationItems = [
    { label: 'Likes' },
    { label: 'Comments' },
    { label: 'New followers' },
    { label: 'Mentions and tags' },
    { label: 'Reposts' },
  ];

  return (
    <SettingSection
      id='push-notifications'
      sectionRef={sectionRef}
      title='Push notifications'
    >
      <div className='relative'>
        <h3 className='text-lg font-medium text-white/90 mx-4 antialiased'>
          In-app notifications
        </h3>
        <button
          className='text-white/60 inline-flex absolute top-1/2 right-0 mx-4 -translate-y-1/2 cursor-pointer'
          onClick={() => setShowNotificationsMenu(!showNotificationsMenu)}
          type='button'
          title='More'
        >
          <Icons.arrowDown
            className={`size-5 transition-transform ${
              showNotificationsMenu ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {showNotificationsMenu && (
        <Fragment>
          {notificationItems.map((item) => (
            <div
              key={item.label}
              className='h-[54px] flex items-center justify-between py-0 px-4'
            >
              <div className='text-base leading-[22px] text-white/90'>
                {item.label}
              </div>
              <Switch />
            </div>
          ))}
        </Fragment>
      )}
    </SettingSection>
  );
};

export default PushNotificationsSection;
