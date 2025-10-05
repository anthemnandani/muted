import DashboardClient from './DashboardClient';

export const metadata = {
  title: 'Dashboard',
  description: 'Page that displays important statistics of Muted',
};

const AdminDashboardPage = () => {
  return <DashboardClient />;
};

export default AdminDashboardPage;
