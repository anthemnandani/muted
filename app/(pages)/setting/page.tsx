import { Metadata } from 'next';
import SettingClient from './SettingClient';

export const metadata: Metadata = {
  title: 'Privacy and Settings',
  description: 'Manage your account settings, privacy, and preferences on Muted.',
  openGraph: {
    title: 'Privacy and Settings',
    description: 'Manage your account settings and privacy on Muted.',
    type: 'website',
    url: '/settings',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy and Settings',
    description: 'Manage your account settings and privacy on Muted.',
  },
};


const SettingPage = () => {
  return <SettingClient />;
};

export default SettingPage;
