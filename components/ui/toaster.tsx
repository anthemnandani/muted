'use client';

import { Toaster as RadToaster } from 'sonner';

export function Toaster() {
  return (
    <RadToaster
      className='w-max flex-center max-h-10 max-w-sm px-2'
      position='bottom-center'
      toastOptions={{
        style: {
          maxHeight: '50px',
          height: 'fit-content',
          width: 'max-content',
          fontWeight: 600,
          fontSize: 15,
        },
      }}
    />
  );
}
