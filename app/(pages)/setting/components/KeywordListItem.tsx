import { KeywordListItemProps } from '@/lib/types';
import { formatFeedsToString } from '@/lib/utils';
import { Trash2 } from 'lucide-react';

const KeywordListItem = ({
  item,
  onDelete,
  isDeleting,
  onEdit,
}: KeywordListItemProps) => {
  return (
    <div className='px-2'>
      <div
        className='flex flex-col w-full h-full bg-white/5 border-b border-b-white/10 rounded-t-lg cursor-pointer'
        onClick={() => onEdit(item)}
      >
        <div className='flex-between pt-4 px-4'>
          <span className='text-base font-medium text-[#F6F6F6] break-words min-w-0'>
            {item.keyword}
          </span>
          <button
            type='button'
            title='Delete'
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            disabled={isDeleting}
          >
            <Trash2 className='size-[22px] text-[#F6F6F6]' />
          </button>
        </div>
        <div className='flex text-white/60 px-4 pb-4 mt-1'>
          <span className='text-sm'>Filter from:</span>
          <span className='ml-1 text-sm font-medium'>
            {formatFeedsToString(item.feeds)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default KeywordListItem;
