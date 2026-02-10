'use client';

import { ProfileTabsHeaderProps, type Tab } from '@/lib/types';
import { cn } from '@/lib/utils';
import React from 'react';
import { Icons } from '../icons';
import { TabsList, TabsTrigger } from '../ui/tabs';

const ProfileTabsHeader = ({
  isOwner,
  activeTab,
  setActiveTab,
}: ProfileTabsHeaderProps) => {
  const tabs = [
    { id: 'posts', icon: <Icons.posts className='size-5' />, label: 'Posts' },
    {
      id: 'reposts',
      icon: <Icons.repost2 className='size-5' />,
      label: 'Reposts',
    },
    ...(isOwner
      ? [
          {
            id: 'collections',
            icon: <Icons.collection className='size-5' />,
            label: 'Collections',
          },
        ]
      : []),
    { id: 'liked', icon: <Icons.liked className='size-5' />, label: 'Liked' },
    { id: 'text', icon: <Icons.threads className='size-5' />, label: 'Text' },
  ];

  const [hoverTab, setHoverTab] = React.useState<string | null>(null);
  const [isTabsContainerHovered, setIsTabsContainerHovered] =
    React.useState(false);

  return (
    <TabsList
      className='relative flex justify-around h-11 w-full'
      onMouseEnter={() => setIsTabsContainerHovered(true)}
      onMouseLeave={() => {
        setIsTabsContainerHovered(false);
        setHoverTab(null);
      }}
    >
      {tabs.map((tab) => (
        <TabsTrigger
          key={tab.id}
          value={tab.id}
          onClick={() => setActiveTab(tab.id as Tab)}
          className='flex items-center relative data-[state=active]:text-white text-white/50 transition-colors'
        >
          <div
            className='group flex items-center gap-1 text-lg font-semibold cursor-pointer px-8 relative'
            onMouseEnter={() => isTabsContainerHovered && setHoverTab(tab.id)}
          >
            <span className='transition-colors'>{tab.icon}</span>
            <span className='font-medium transition-colors'>{tab.label}</span>
            {(hoverTab === tab.id || (tab.id === activeTab && !hoverTab)) && (
              <div
                className={cn(
                  'absolute -bottom-2.5 left-0 right-0 h-[2px] bg-white/90',
                  hoverTab === tab.id && 'animate-tab-slide',
                  tab.id === activeTab && !hoverTab && 'scale-x-100',
                )}
              />
            )}
          </div>
        </TabsTrigger>
      ))}
    </TabsList>
  );
};

export default ProfileTabsHeader;
