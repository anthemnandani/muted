import ConfirmDialog from '@/components/modals/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import type { Page } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { api } from '@/trpc/react';
import { Edit, Eye, FileText, Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Fragment, useState } from 'react';

const AdminPageTableRow = ({ id, updatedAt, title, slug }: Page) => {
  const [open, setOpen] = useState(false);

  const utils = api.useUtils();
  const { mutate: deletePage, isPending: isDeleting } =
    api.admin.deletePage.useMutation({
      onSettled: async () => {
        await utils.admin.getAllPages.invalidate();
        await utils.admin.getPage.invalidate();
      },
    });

  return (
    <Fragment>
      <TableRow className='bg-transparent hover:bg-muted/30'>
        <TableCell className='px-6 py-4 font-medium text-white'>
          <div className='flex items-center gap-3'>
            <FileText className='size-4 text-primary-blue' />
            {title}
          </div>
        </TableCell>
        <TableCell className='px-6 py-4 font-mono text-xs text-white/70'>
          /{slug}
        </TableCell>
        <TableCell className='px-6 py-4 text-white/70'>
          {formatDate(updatedAt)}
        </TableCell>
        <TableCell className='px-6 py-4 text-center space-x-2'>
          <Link href={`/pages/${slug}`} target='_blank'>
            <Button
              variant='ghost'
              size='icon'
              className='size-8 text-primary-blue hover:text-primary-blue/90 hover:bg-white/10'
            >
              <Eye className='size-4' />
            </Button>
          </Link>

          <Link href={`/admin/pages/${slug}`}>
            <Button
              variant='ghost'
              size='icon'
              className='size-8 text-white/70 hover:text-white hover:bg-white/10'
            >
              <Edit className='size-4' />
            </Button>
          </Link>
          <Button
            variant='ghost'
            size='icon'
            disabled={isDeleting}
            onClick={() => setOpen(true)}
            className='size-8 text-primary-red hover:text-primary-red/90 hover:bg-white/10'
          >
            {isDeleting ? (
              <Loader2 className='size-5 animate-spin' />
            ) : (
              <Trash2 className='size-4' />
            )}
          </Button>
        </TableCell>
      </TableRow>
      <ConfirmDialog
        title={`Delete "${title}"`}
        open={open}
        setOpen={setOpen}
        onClick={() => deletePage({ id })}
        description={`Are you sure you want to delete ${title} page?`}
        isLoading={isDeleting}
      />
    </Fragment>
  );
};

export default AdminPageTableRow;
