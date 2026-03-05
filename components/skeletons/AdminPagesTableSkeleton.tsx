import { Skeleton } from '../ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

const AdminPagesTableSkeleton = () => {
  return (
    <div className='overflow-hidden rounded-lg border bg-card'>
      <Table>
        <TableHeader>
          <TableRow className='bg-muted/40'>
            <TableHead className='px-6 py-4'>Page Title</TableHead>
            <TableHead className='px-6 py-4'>URL Slug</TableHead>
            <TableHead className='px-6 py-4'>Last Updated</TableHead>
            <TableHead className='px-6 py-4 text-center'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(10)].map((_, index) => (
            <TableRow key={index} className='hover:bg-transparent'>
              <TableCell colSpan={4}>
                <Skeleton className='h-12 w-full' />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminPagesTableSkeleton;
