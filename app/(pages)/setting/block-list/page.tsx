import { Metadata } from 'next';
import BlockListClient from './BlockListClient';

export const metadata: Metadata = {
  title: 'Block List',
  description: 'Manage your blocked accounts on Muted.',
};

const BlockListPage = () => {
  return <BlockListClient />;
};

export default BlockListPage;
