import { SidebarWrapperProps } from '@/lib/types';
import { X } from 'lucide-react';

const SidebarWrapper = ({
  children,
  isOpen,
  title,
  setIsOpen,
}: SidebarWrapperProps) => {
  return (
    <div
      className='fixed left-[76px] top-0 h-screen w-[20rem] bg-background shadow-[5px_0px_15px_rgba(0,0,0,0.25)] border-l border-white/5 overflow-hidden transition-transform duration-300 ease-in-out z-[9999]'
      style={{
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        pointerEvents: isOpen ? 'auto' : 'none',
        opacity: isOpen ? 1 : 0,
      }}
    >
      <div className='w-full'>
        <div className='h-[4.4rem] p-4'>
          <div className='flex items-center'>
            <h2 className='text-xl font-bold text-white/90'>{title}</h2>
            <button
              title='Close'
              onClick={() => setIsOpen(false)}
              className='ml-auto bg-white/10 hover:bg-white/20 transition-colors duration-150 size-7 rounded-full flex-center'
            >
              <X size={16} className='text-white/90' />
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default SidebarWrapper;
