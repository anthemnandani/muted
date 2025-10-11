'use client';

import { Fragment } from 'react';
import SiteHeader from '../../components/SiteHeader';
import UserFilters from '../../components/UserFilters';
import UsersTable from '../../components/UsersTable';

const ManageUsersClient = () => {
  return (
    <Fragment>
      <SiteHeader title='Manage Users' />
      <section className='space-y-4 px-4 lg:px-6 mt-6'>
        <UserFilters />
        <UsersTable />
      </section>
    </Fragment>
  );
};

export default ManageUsersClient;
