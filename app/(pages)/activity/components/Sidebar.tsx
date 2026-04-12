import { ACTIVITY_SIDEBAR_ITEMS } from '@/lib/constants';
import type { SubPanel } from '@/lib/types';
import React from 'react';

const Sidebar = ({
  activePanel,
  setActivePanel,
}: {
  activePanel: SubPanel;
  setActivePanel: (panel: SubPanel) => void;
}) => {
  return (
    <div className='w-64 flex-shrink-0'>
      <nav className='flex flex-col gap-0.5'>
        {ACTIVITY_SIDEBAR_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePanel(item.id)}
            className={`flex items-start gap-3 px-4 py-3.5 rounded-xl text-left transition-all ${
              activePanel === item.id
                ? 'bg-white/[0.06]'
                : 'hover:bg-white/[0.03]'
            }`}
          >
            <item.icon
              className={`size-6 mt-0.5 flex-shrink-0 ${
                activePanel === item.id ? 'text-white' : 'text-white/50'
              }`}
            />
            <div>
              <p
                className={`text-sm font-semibold ${
                  activePanel === item.id ? 'text-white' : 'text-white/80'
                }`}
              >
                {item.label}
              </p>
              <p className='text-xs text-white/40 mt-0.5 leading-snug'>
                {item.description}
              </p>
            </div>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
