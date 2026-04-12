import { formatCount } from '@/lib/utils';

const EngagementRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
}) => (
  <div className='flex items-center gap-3 p-3 rounded-lg bg-white/[0.04]'>
    <Icon className='size-5 text-white/50' />
    <div>
      <p className='text-lg font-bold text-white'>{formatCount(value)}</p>
      <p className='text-xs text-white/55'>{label}</p>
    </div>
  </div>
);

export default EngagementRow;
