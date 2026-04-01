import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import { ChatProvider } from '@/contexts/ChatContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { TRPCReactProvider } from '@/trpc/react';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { headers } from 'next/headers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const APP_NAME = 'Muted';
const APP_DESCRIPTION =
  'Muted is a social media platform for sharing thoughts and ideas in a distraction-free environment.';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

// export const viewport: Viewport = {
//   width: 'device-width',
//   initialScale: 1,
//   maximumScale: 5,
//   themeColor: [
//     { media: '(prefers-color-scheme: light)', color: '#ffffff' },
//     { media: '(prefers-color-scheme: dark)', color: '#000000' },
//   ],
// };

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),

  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,

  keywords: [
    'Muted',
    'Social Media',
    'Thoughts',
    'Ideas',
    'Social Network',
    'Community',
    'Sharing Platform',
  ],

  // Authors and creators
  // authors: [{ name: 'Your Name', url: APP_URL }],
  // creator: 'Your Name or Company',
  // publisher: 'Your Company',

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: APP_URL,
    title: APP_NAME,
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
    images: [
      {
        url: `${APP_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: APP_NAME,
      },
    ],
  },

  // Twitter card metadata
  twitter: {
    card: 'summary_large_image',
    title: APP_NAME,
    description: APP_DESCRIPTION,
    // creator: '@yourhandle',
    // images: [`${APP_URL}/twitter-image.jpg`],
  },

  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      'max-video-preview': -1,
      'max-image-preview': 'none',
      'max-snippet': -1,
    },
  },

  // Icons
  // icons: {
  //   icon: '/favicon.ico',
  //   shortcut: '/favicon-16x16.png',
  //   apple: '/apple-touch-icon.png',
  //   other: [
  //     {
  //       rel: 'icon',
  //       type: 'image/png',
  //       sizes: '32x32',
  //       url: '/favicon-32x32.png',
  //     },
  //     {
  //       rel: 'icon',
  //       type: 'image/png',
  //       sizes: '16x16',
  //       url: '/favicon-16x16.png',
  //     },
  //     {
  //       rel: 'mask-icon',
  //       url: '/safari-pinned-tab.svg',
  //       color: '#5bbad5',
  //     },
  //   ],
  // },

  // Manifest for PWA
  // manifest: `${APP_URL}/site.webmanifest`,

  // Verification codes for search engines
  // verification: {
  //   google: 'your-google-site-verification',
  //   yandex: 'your-yandex-verification',
  //   yahoo: 'your-yahoo-verification',
  //   bing: 'your-bing-verification',
  // },

  // App links
  appleWebApp: {
    title: APP_NAME,
    statusBarStyle: 'black-translucent',
    capable: true,
  },

  alternates: {
    canonical: APP_URL,
  },
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
              <SocketProvider>
                <ChatProvider>
                  <div className='min-h-screen flex flex-col'>{children}</div>
                  <Toaster />
                </ChatProvider>
              </SocketProvider>
            </ClerkProvider>
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
