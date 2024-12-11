import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ProfileTabItemProps {
  href: string;
  isActive: boolean;
  label: string;
  className?: string;
}

const ProfileTabItem = ({
  href,
  isActive,
  label,
  className,
}: ProfileTabItemProps) => {
  return (
    <Link
      href={href}
      className={cn(
        'flex-center w-full h-12 font-medium duration-200 text-muted-foreground',
        isActive && 'border-b-2 border-foreground text-foreground',
        className
      )}
    >
      {label}
    </Link>
  );
};

export default ProfileTabItem;
