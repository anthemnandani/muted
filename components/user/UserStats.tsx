import { cn, formatCount } from '@/lib/utils';
import Link from 'next/link';

interface StatItemProps {
  count: number;
  label: string;
  href: string;
  className?: string;
}

const StatItem = ({ count, label, href, className }: StatItemProps) => (
  <Link
    href={href}
    className={cn('hover:opacity-80 transition-opacity', className)}
  >
    <span className='font-semibold text-foreground'>{formatCount(count)}</span>{' '}
    <span className='text-zinc-600 dark:text-gray-3'>{label}</span>
  </Link>
);

interface UserStatsProps {
  username: string;
  following: number;
  followers: number;
  className?: string;
}

const UserStats = ({
  username,
  following,
  followers,
  className,
}: UserStatsProps) => {
  return (
    <div className={cn('text-sm flex gap-2.5', className)}>
      <StatItem
        count={following}
        label='Following'
        href={`/${username}/following`}
      />
      <StatItem
        count={followers}
        label='Followers'
        href={`/${username}/followers`}
      />
    </div>
  );
};

export default UserStats;
