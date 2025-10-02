import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SectionCardsProps } from '@/lib/types';
import { cn } from '@/lib/utils';

const SectionCard = ({ title, value }: { title: string; value: number }) => {
  const formatNumber = (num: number) =>
    new Intl.NumberFormat('en-US').format(num);

  return (
    <Card className='@container/card' data-slot='card'>
      <CardHeader className='relative'>
        <CardDescription>{title}</CardDescription>
        <CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums'>
          {formatNumber(value)}
        </CardTitle>
      </CardHeader>
    </Card>
  );
};

const SectionCards = ({
  totalUsers,
  totalPosts,
  newUsers24h,
  activeUsers24h,
}: SectionCardsProps) => {
  return (
    <div
      className={cn(
        '*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1',
        'gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card',
        'dark:*:data-[slot=card]:bg-card lg:px-6'
      )}
    >
      <SectionCard title='Total Users' value={totalUsers} />
      <SectionCard title='Total Posts' value={totalPosts} />
      <SectionCard title='New Users (24h)' value={newUsers24h} />
      <SectionCard title='Active Users (24h)' value={activeUsers24h} />
    </div>
  );
};

export default SectionCards;
