import SettingSection from './SettingSection';
import SettingRow from './SettingRow';

const ManageAccountSection: React.FC<{
  sectionRef: React.RefObject<HTMLDivElement>;
}> = ({ sectionRef }) => {
  return (
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
          <button className='text-base leading-[22px] text-blue-400 hover:text-blue-300'>
            Delete
          </button>
        }
      />
    </SettingSection>
  );
};

export default ManageAccountSection;
