import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type AuthorProps } from '@/lib/types';

interface UserCardProps {
  user: AuthorProps;
  handleUserSelection: (user: AuthorProps) => void;
  targetUserId: string | null;
}

const UserCard = ({
  user,
  handleUserSelection,
  targetUserId,
}: UserCardProps) => {
  return (
    <div key={user.id} className='border-b border-zinc-800 last:border-b-0'>
      <button
        className='w-full flex-between p-3 hover:bg-zinc-800/30 transition-colors text-left'
        onClick={() => handleUserSelection(user)}
        type='button'
      >
        <div className='flex items-center gap-3'>
          <Avatar className='size-10 relative overflow-visible cursor-pointer outline outline-1 outline-border'>
            <AvatarImage
              src={user.image ?? ''}
              alt={user.fullName ?? ''}
              className='rounded-full object-cover'
            />
            <AvatarFallback>
              {user.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className='text-white font-medium'>
              {user.fullName || user.username}
            </p>
            <p className='text-white/60 text-sm'>{user.username}</p>
          </div>
        </div>
        <div
          className={`size-6 rounded-full border-2 ${
            targetUserId === user.id
              ? 'border-primary-red bg-primary-red flex-center'
              : 'border-white/40'
          }`}
        >
          {targetUserId === user.id && (
            <div className='size-2 rounded-full bg-white'></div>
          )}
        </div>
      </button>
    </div>
  );
};

export default UserCard;
