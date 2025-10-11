import { Icons } from '@/components/icons';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

const TableLoader = () => {
  return (
    <Table>
      <TableBody>
        <TableRow>
          <TableCell colSpan={7} className='py-4 text-center'>
            <div className='flex-center'>
              <Icons.loading className='size-11' />
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default TableLoader;
