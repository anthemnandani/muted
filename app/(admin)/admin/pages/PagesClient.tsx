'use client';

import PagesTable from '../../components/AdminPagesTable';
import PagesForm from '../../components/PagesForm';

const PagesClient = () => {
  return (
    <div className='p-8 space-y-8'>
      <PagesForm />
      <PagesTable />
    </div>
  );
};

export default PagesClient;
