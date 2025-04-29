import { EmptyStateProps } from '@/lib/types';

const EmptyState = ({ icon, title, description }: EmptyStateProps) => {
  return (
    <div className='flex-col-center w-full h-full min-h-[490px] text-center mx-auto'>
      <div className='size-[92px] rounded-full flex-center bg-zinc-800'>
        {icon}
      </div>
      <p className='text-2xl font-bold text-white/90 mt-6'>{title}</p>
      {description && (
        <p className='text-base font-normal text-white/75 mt-2'>
          {description}
        </p>
      )}
    </div>
  );
};

export default EmptyState;
