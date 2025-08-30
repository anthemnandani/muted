'use client';

import SettingSection from './SettingSection';
import SettingRow from './SettingRow';
import DeleteUser from '@/components/modals/DeleteUser';
import { Fragment } from 'react';
import useSettingStore from '@/store/settingStore';

const ManageAccountSection: React.FC<{
  sectionRef: React.RefObject<HTMLDivElement>;
}> = ({ sectionRef }) => {
  const setIsOpen = useSettingStore((state) => state.setIsOpen);
  return (
    <Fragment>
      <SettingSection
        id='manage-account'
        sectionRef={sectionRef}
        title='Manage account'
      >
        <h3 className='text-lg font-medium text-white/90 mx-4 mb-3 antialiased'>
          Account control
        </h3>
        <SettingRow
          title='Delete account'
          control={
            <button
              className='text-base leading-[22px] text-primary-blue font-medium'
              onClick={() => setIsOpen(true)}
            >
              Delete
            </button>
          }
        />
      </SettingSection>
      <DeleteUser />
    </Fragment>
  );
};

export default ManageAccountSection;
