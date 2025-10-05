'use client';

import { Fragment } from 'react';
import SiteHeader from '../../components/SiteHeader';
import ContentFilters from '../../components/ContentFilters';
import ContentTable from '../../components/ContentTable';

const ContentModerationClient = () => {
  return (
    <Fragment>
      <SiteHeader title='Content Moderation' />
      <section className='space-y-4 px-4 lg:px-6 mt-6'>
        <ContentFilters />
        <ContentTable />
      </section>
    </Fragment>
  );
};

export default ContentModerationClient;
