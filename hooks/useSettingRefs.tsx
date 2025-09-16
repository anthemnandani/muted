import { useRef } from 'react';

export const useSettingRefs = () => {
  const sectionRefs = {
    'manage-account': useRef<HTMLDivElement>(null),
    privacy: useRef<HTMLDivElement>(null),
    // 'push-notifications': useRef<HTMLDivElement>(null),
    'content-preferences': useRef<HTMLDivElement>(null),
    about: useRef<HTMLDivElement>(null),
  };

  return sectionRefs;
};
