'use client';

import { Fragment } from 'react';
import ReportFilters from '../../components/ReportFilters';
import ReportsTable from '../../components/ReportsTable';
import SiteHeader from '../../components/SiteHeader';

const ManageReportsClient = () => {
  return (
    <Fragment>
      <SiteHeader title='Manage Reports' />
      <section className='space-y-4 px-4 lg:px-6 mt-6'>
        <ReportFilters />
        <ReportsTable />
      </section>
    </Fragment>
  );
};

export default ManageReportsClient;
