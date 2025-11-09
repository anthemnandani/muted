import { Skeleton } from '../ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

const AdminReportsTableSkeleton = () => {
  return (
    <div className='overflow-hidden rounded-lg border bg-card'>
      <Table>
        <TableHeader>
          <TableRow className='bg-muted/40'>
            <TableHead className='w-[18%] pl-6'>Reported Item</TableHead>
            <TableHead className='w-[10%]'>Report Type</TableHead>
            <TableHead className='w-[18%]'>Reporter</TableHead>
            <TableHead className='w-[10%]'>Status</TableHead>
            <TableHead className='w-[14%]'>Reported Date</TableHead>
            <TableHead className='w-[20%] pr-6'>Reason</TableHead>
            <TableHead className='text-center pr-6'>Actions</TableHead>
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

export default AdminReportsTableSkeleton;
