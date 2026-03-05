import AdminPagesTableSkeleton from '@/components/skeletons/AdminPagesTableSkeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { api } from '@/trpc/react';
import AdminPageTableRow from './AdminPageTableRow';

const PagesTable = () => {
  const { data: pages, isLoading } = api.page.getAllPages.useQuery(undefined, {
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  });

  if (isLoading) {
    return <AdminPagesTableSkeleton />;
  }

  return (
    <div className='rounded-lg border'>
      <Table>
        <TableHeader className='sticky top-0 z-10 bg-muted/50 backdrop-blur supports-[backdrop-filter]:bg-muted/40'>
          <TableRow className='bg-transparent hover:bg-muted/30'>
            <TableHead className='px-6 py-4'>Page Title</TableHead>
            <TableHead className='px-6 py-4'>URL Slug</TableHead>
            <TableHead className='px-6 py-4 font-medium'>
              Last Updated
            </TableHead>
            <TableHead className='px-6 py-4 font-medium text-center'>
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pages?.length === 0 ? (
            <TableRow className='bg-transparent hover:bg-muted/30'>
              <TableCell
                colSpan={4}
                className='px-6 py-8 text-center text-white/40'
              >
                No pages found. Create your first one above.
              </TableCell>
            </TableRow>
          ) : (
            pages?.map((page) => <AdminPageTableRow {...page} key={page.id} />)
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PagesTable;
