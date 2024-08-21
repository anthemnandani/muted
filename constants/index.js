import { Icons } from '@/components/icons';

export const sidebarLinks = [
  {
    icon: Icons.home,
    route: '/',
    label: 'Home',
    addFill: true,
  },
  {
    icon: Icons.search,
    route: '/search',
    label: 'Search',
  },
  {
    icon: Icons.activity,
    route: '/activity',
    label: 'Activity',
    addFill: true,
  },
  {
    icon: Icons.profile,
    route: '/profile',
    label: 'Profile',
    addFill: true,
  },
];

export const profileTabs = [
  { value: 'threads', label: 'Threads', icon: '/assets/reply.svg' },
  { value: 'replies', label: 'Replies', icon: '/assets/members.svg' },
  // { value: 'tagged', label: 'Tagged', icon: '/assets/tag.svg' },
];

export const communityTabs = [
  { value: 'threads', label: 'Threads', icon: '/assets/reply.svg' },
  { value: 'members', label: 'Members', icon: '/assets/members.svg' },
  // { value: 'requests', label: 'Requests', icon: '/assets/request.svg' },
];
