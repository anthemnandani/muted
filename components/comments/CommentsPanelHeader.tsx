import { X } from 'lucide-react';
import SortComments from '../menus/SortComments';

const CommentsPanelHeader = ({
  repliesCount,
  onClose,
}: {
  repliesCount: number;
  onClose: () => void;
}) => {
  return (
    <div className='flex-between px-4 py-3 border-b border-border-light'>
      <div className='flex items-center gap-2'>
        <h2 className='text-lg font-semibold text-white'>
          Comment{repliesCount === 1 ? '' : 's'}
        </h2>
        <span className='text-gray-400 text-sm'>{repliesCount}</span>
      </div>
      <div className='flex items-center gap-3'>
        <SortComments />
        <button className='text-gray-400' onClick={onClose}>
          <X className='size-5' />
        </button>
      </div>
    </div>
  );
};

export default CommentsPanelHeader;
