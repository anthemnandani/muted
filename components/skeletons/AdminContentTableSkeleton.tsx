import { Skeleton } from '../ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

const AdminContentTableSkeleton = () => {
  return (
    <div className='overflow-hidden rounded-lg border bg-card'>
      <Table>
        <TableHeader>
          <TableRow className='bg-muted/40'>
            <TableHead className='w-[25%]'>Content Preview</TableHead>
            <TableHead>Author</TableHead>
            <TableHead className='whitespace-nowrap'>Content Type</TableHead>
            <TableHead>Metrics</TableHead>
            <TableHead>Date Created</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(15)].map((_, index) => (
            <TableRow key={index} className='hover:bg-transparent'>
              <TableCell colSpan={7}>
                <Skeleton className='h-12 w-full' />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminContentTableSkeleton;
