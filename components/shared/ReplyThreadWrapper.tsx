'use client';
import { cn } from '@/lib/utils';
import React from 'react';
import { Separator } from '../ui/separator';

interface ReplyThreadWrapperProps {
  children: React.ReactNode;
  isChildThread?: boolean;
}

const ReplyThreadWrapper: React.FC<ReplyThreadWrapperProps> = ({
  children,
  isChildThread = false,
}) => {
  const childrenArray = React.Children.toArray(children);

  return (
    <>
      {React.Children.map(childrenArray, (child, index) => (
        <React.Fragment key={index}>
          {child}
          {index < childrenArray.length - 1 && (
            <Separator className={cn('my-4', isChildThread && '-ml-4')} />
          )}
        </React.Fragment>
      ))}
    </>
  );
};

export default ReplyThreadWrapper;
