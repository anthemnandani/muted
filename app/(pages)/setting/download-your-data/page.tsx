import { Metadata } from 'next';
import DownloadDataClient from './DownloadDataClient';

export const metadata: Metadata = {
  title: 'Download Your Data',
  description: 'Download your Muted account data.',
};

const DownloadDataPage = () => {
  return <DownloadDataClient />;
};

export default DownloadDataPage;
