'use client';

import { Toaster as RadToaster } from 'sonner';

export function Toaster() {
  return (
    <RadToaster
      position='bottom-right'
      toastOptions={{
        style: {
          fontWeight: 600,
          fontSize: 15,
        },
      }}
    />
  );
}
