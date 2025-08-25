import { SettingSectionProps } from '@/lib/types';

const SettingSection: React.FC<SettingSectionProps> = ({
  id,
  sectionRef,
  title,
  children,
}) => {
  return (
    <div
      ref={sectionRef}
      id={id}
      className='mt-7 block relative pb-4 last:pb-0 first:mt-0'
    >
      <div className='relative'>
        <h2 className='text-2xl mb-5 mx-2 font-bold text-white/90 block antialiased'>
          {title}
        </h2>
        {children}
        <div className='custom-separator'></div>
      </div>
    </div>
  );
};

export default SettingSection;
