import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
}

const EmptyState = ({ icon, title, description }: EmptyStateProps) => {
  return (
    <div className='flex-col-center w-full h-full min-h-[490px] text-center mx-auto'>
      {icon}
      <p className='text-2xl font-bold text-white/90 mt-6'>{title}</p>
      <p className='text-base font-normal text-white/75 mt-2'>{description}</p>
    </div>
  );
};

export default EmptyState;
