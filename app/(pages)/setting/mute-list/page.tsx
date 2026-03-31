import { Metadata } from 'next';
import MuteListClient from './MuteListClient';

export const metadata: Metadata = {
  title: 'Mute List',
  description: 'Manage your muted accounts on Muted.',
};

const MuteListPage = () => {
  return <MuteListClient />;
};

export default MuteListPage;
