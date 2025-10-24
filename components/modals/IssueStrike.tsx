import { STRIKE_REASON_OPTIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';
import { ShieldBan } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Label } from '../ui/label';

const IssueStrike = ({
  userId,
  postId,
}: {
  userId: string;
  postId: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | undefined>();
  const utils = api.useUtils();

  const { mutate: issueStrike, isLoading } = api.admin.issueStrike.useMutation({
    onSuccess: () => {
      toast.success('Strike issued successfully.');
      setIsOpen(false);
      setSelectedReason(undefined);
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      utils.admin.getAllPosts.invalidate();
      utils.admin.getAllUsers.invalidate();
    },
  });

  const handleSubmit = () => {
    if (!selectedReason) {
      toast.warning('Please select a reason for the strike.');
      return;
    }

    issueStrike({ userId, postId, reason: selectedReason });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          title='Issue Strike'
          // onClick={handleOpenStrikeDialog}
        >
          <ShieldBan className='size-5 text-red-500' />
          <span className='sr-only'>Issue Strike</span>
        </Button>
      </DialogTrigger>

      <DialogContent
        className={cn(
          'w-full md:max-w-[600px]',
          'select-none border-none bg-transparent shadow-none outline-none p-0'
        )}
      >
        <Card className='rounded-none md:rounded-2xl border-none shadow-2xl ring-1 ring-[#393939] ring-offset-0 bg-gray-6'>
          <div className='border-b border-border p-4 flex items-center'>
            <h2 className='flex-1 text-center text-lg font-semibold'>
              Issue a Strike
            </h2>
            <div className='w-9 h-9' />
          </div>
          <div className='p-4 space-y-4'>
            <p className='text-md text-muted-foreground text-center'>
              Please provide a reason for this strike. This will hide the
              content and apply a penalty based on the user's strike history.
            </p>

            <div className='grid w-full items-center gap-1.5'>
              <Label htmlFor='strike-reason' className='mb-2'>
                Reason
              </Label>
              <Select onValueChange={setSelectedReason} value={selectedReason}>
                <SelectTrigger
                  id='strike-reason'
                  className='focus:ring-0 focus:ring-offset-0'
                >
                  <SelectValue placeholder='Select a reason for the strike...' />
                </SelectTrigger>

                <SelectContent className='z-[9999] bg-zinc-900'>
                  {STRIKE_REASON_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className='cursor-pointer'
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className='p-4 border-t border-border flex-row justify-end space-x-2'>
            <Button
              variant='secondary'
              onClick={() => {
                setIsOpen(false);
                setSelectedReason(undefined);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !selectedReason}
            >
              {isLoading ? 'Issuing...' : 'Confirm Strike'}
            </Button>
          </DialogFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default IssueStrike;
