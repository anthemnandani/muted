'use client';

import {
  OptimisticActionProvider,
  type TargetType,
} from '@/contexts/OptimisticActionContext';
import { QUERY_TYPE } from '@/lib/constants';
import { type SubPanel } from '@/lib/types';
import { useActivityStore } from '@/store/activityStore';
import { useMemo, useState } from 'react';
import InteractionsContent from './components/InteractionsContent';
import MediaContent from './components/MediaContent';
import Sidebar from './components/Sidebar';
import StatsContent from './components/StatsContent';

const ActivityClient = () => {
  const [activePanel, setActivePanel] = useState<SubPanel>('interactions');
  const { resetActivityState } = useActivityStore();

  const optimisticTarget = useMemo(
    () => ({ type: QUERY_TYPE.ACTIVITY, variables: {} }),
    [],
  );

  const handlePanelChange = (panel: SubPanel) => {
    resetActivityState();
    setActivePanel(panel);
  };

  return (
    <OptimisticActionProvider target={optimisticTarget as TargetType}>
      <main className='flex justify-between w-screen max-w-full flex-auto self-center relative'>
        <div className='max-w-6xl w-[calc(100%-120px)] mx-auto pt-5 md:pt-8 pb-20'>
          <div className='flex flex-col flex-[1_1_auto]'>
            <h1 className='text-lg font-bold text-white mb-5'>Your activity</h1>

            <div className='flex gap-6'>
              <Sidebar
                activePanel={activePanel}
                setActivePanel={handlePanelChange}
              />

              <div className='flex-1 min-w-0'>
                {activePanel === 'interactions' && <InteractionsContent />}
                {activePanel === 'media' && <MediaContent />}
                {activePanel === 'dashboard' && <StatsContent />}
              </div>
            </div>
          </div>
        </div>
      </main>
    </OptimisticActionProvider>
  );
};

export default ActivityClient;
