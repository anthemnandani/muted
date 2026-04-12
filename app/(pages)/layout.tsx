import Report from '@/components/modals/Report';
import TopBar from '@/components/shared/TopBar';
import LeftSideBar from '@/components/sidebars/LeftSideBar';
import { PostNavigatorProvider } from '@/contexts/PostNavigatorContext';
import { db } from '@/server/db';
import { currentUser } from '@clerk/nextjs/server';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: {
    default: 'Muted',
    template: '%s | Muted',
  },
  description:
    'Muted is a social platform to share posts, videos, and conversations.',
  openGraph: {
    title: 'Muted',
    description: 'Share posts, videos, and connect with others on Muted.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Muted',
    description: 'Join Muted and explore content.',
  },
};

export default async function PagesLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const user = await currentUser();
  const headersList = headers();
  const userAgent = headersList.get('user-agent') || '';
  const isCrawler =
    /facebookexternalhit|facebot|twitterbot|linkedinbot|whatsapp|slackbot|telegrambot|discordbot|googlebot|bingbot|Baiduspider|yandex/i.test(
      userAgent,
    );

  if (!isCrawler) {
    if (!user) redirect('/sign-in');

    const dbUser = await db.user.findUnique({
      where: {
        id: user?.id,
      },
      select: {
        verified: true,
        deactivated: true,
      },
    });

    if (dbUser?.deactivated) redirect('/reactivate');

    if ((dbUser && !dbUser.verified) || !dbUser) redirect('/account?origin=/');
  }

  return (
    <>
      <TopBar />
      <LeftSideBar />
      <PostNavigatorProvider>{children}</PostNavigatorProvider>
      {/* <BottomBar /> */}
      <Report />
      {modal}
    </>
  );
}
