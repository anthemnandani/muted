'use client';

import { Fragment } from 'react';
import AppealFilters from '../../components/AppealFilters';
import AppealsTable from '../../components/AppealsTable';
import SiteHeader from '../../components/SiteHeader';

const ManageAppealsClient = () => {
  return (
    <Fragment>
      <SiteHeader title='Appeals' />
      <section className='space-y-4 px-4 lg:px-6 mt-6'>
        <AppealFilters />
        <AppealsTable />
      </section>
    </Fragment>
  );
};

export default ManageAppealsClient;
