import { Skeleton } from '../ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

const AdminUsersTableSkeleton = () => {
  return (
    <div className='overflow-hidden rounded-lg border bg-card'>
      <Table>
        <TableHeader>
          <TableRow className='bg-muted/40'>
            <TableHead className='w-[20%] pl-6'>User</TableHead>
            <TableHead className='w-[20%]'>Email</TableHead>
            <TableHead>Posts</TableHead>
            <TableHead>Followers</TableHead>
            <TableHead>Strikes</TableHead>
            <TableHead className='w-[15%]'>Date Created</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className='text-center pr-6'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(15)].map((_, index) => (
            <TableRow key={index} className='hover:bg-transparent'>
              <TableCell colSpan={8}>
                <Skeleton className='h-12 w-full' />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminUsersTableSkeleton;
