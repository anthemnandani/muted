import { Card } from '@/components/ui/card';
import { KPICardProps } from '@/lib/types';
import { formatCount } from '@/lib/utils';
import DeltaBadge from './DeltaBadge';

const KPICard = ({ icon: Icon, label, value, delta }: KPICardProps) => (
  <Card className='bg-white/[0.02] border-white/[0.06] p-4'>
    <div className='flex items-center gap-2 mb-2.5'>
      <div className='size-7 rounded-lg flex items-center justify-center bg-white/[0.04]'>
        <Icon className='size-3.5 text-white/50' />
      </div>
      <span className='text-[11px] text-white/40 font-medium uppercase tracking-wider'>
        {label}
      </span>
    </div>
    <div className='flex items-end gap-2'>
      <span className='text-2xl font-bold text-white tabular-nums'>
        {typeof value === 'number' ? formatCount(value) : value}
      </span>
      {delta !== undefined && <DeltaBadge value={delta} />}
    </div>
  </Card>
);

export default KPICard;
