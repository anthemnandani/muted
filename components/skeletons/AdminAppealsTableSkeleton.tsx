import { Skeleton } from '../ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

const AdminAppealsTableSkeleton = () => {
  return (
    <div className='overflow-hidden rounded-lg border bg-card'>
      <Table>
        <TableHeader>
          <TableRow className='bg-muted/40'>
            <TableHead className='w-[20%] pl-6'>User</TableHead>
            <TableHead className='w-[15%]'>Suspension Date</TableHead>
            <TableHead className='w-[30%]'>Reason</TableHead>
            <TableHead className='w-[15%]'>Submitted At</TableHead>
            <TableHead className='w-[10%]'>Status</TableHead>
            <TableHead className='w-[10%]'>Actions</TableHead>
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

export default AdminAppealsTableSkeleton;
