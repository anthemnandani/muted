import { ThemeProvider } from '@/components/providers/ThemeProvider';
import FullscreenImageView from '@/components/shared/FullScreenImageView';
import { Toaster } from '@/components/ui/toaster';
import { TRPCReactProvider } from '@/trpc/react';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { headers } from 'next/headers';
import { Suspense } from 'react';
import Loading from './(pages)/loading';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Muted',
  description:
    'Muted is a social media platform for sharing thoughts and ideas.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <TRPCReactProvider headers={headers()}>
          <ThemeProvider
            attribute='class'
            defaultTheme='dark'
            enableSystem
            disableTransitionOnChange
          >
            <ClerkProvider
              appearance={{
                baseTheme: dark,
              }}
            >
              {children}
              <Toaster />
              <Suspense fallback={<Loading />}>
                <FullscreenImageView />
              </Suspense>
            </ClerkProvider>
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
