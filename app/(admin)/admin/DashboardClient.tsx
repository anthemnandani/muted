'use client';

import Error from '@/app/error';
import AdminDashboardSkeleton from '@/components/skeletons/AdminDashboardSkeleton';
import { api } from '@/trpc/react';
import { Fragment } from 'react';
import DashboardCharts from '../components/DashboardCharts';
import SectionCards from '../components/SectionCards';
import SiteHeader from '../components/SiteHeader';

const DashboardClient = () => {
  const {
    data: adminData,
    isLoading,
    isError,
  } = api.admin.getDashboardAnalytics.useQuery();

  if (isError) return <Error />;

  return (
    <Fragment>
      <SiteHeader title='Dashboard' />
      <div className='flex flex-1 flex-col'>
        <div className='@container/main flex flex-1 flex-col gap-2'>
          <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
            {isLoading ? (
              <AdminDashboardSkeleton />
            ) : (
              <Fragment>
                <SectionCards
                  totalUsers={adminData.totalUsers}
                  totalPosts={adminData.totalPosts}
                  newUsers24h={adminData.newUsers24h}
                  activeUsers24h={adminData.activeUsers24h}
                />
                <div className='px-4 lg:px-6'>
                  <DashboardCharts
                    usersChartData={adminData.usersChartData}
                    postsChartData={adminData.postsChartData}
                  />
                </div>
              </Fragment>
            )}
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default DashboardClient;
