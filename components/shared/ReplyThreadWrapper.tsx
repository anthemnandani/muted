'use client';
import React from 'react';
import { Separator } from '../ui/separator';

interface ReplyThreadWrapperProps {
  children: React.ReactNode;
}

const ReplyThreadWrapper: React.FC<ReplyThreadWrapperProps> = ({
  children,
}) => {
  const childrenArray = React.Children.toArray(children);

  return (
    <>
      {React.Children.map(childrenArray, (child, index) => (
        <div key={index}>
          {child}
          {index < childrenArray.length - 1 && <Separator className='my-4' />}
        </div>
      ))}
    </>
  );
};

export default ReplyThreadWrapper;
