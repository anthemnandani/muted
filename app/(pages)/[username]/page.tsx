import { db } from '@/server/db';
import { Metadata } from 'next';
import ProfileClient from './ProfileClient';

export async function generateMetadata(
  { params }: { params: { username: string } }
): Promise<Metadata> {
  const username = decodeURIComponent(params.username).substring(1);

  const user = await db.user.findUnique({
    where: { username, deactivated: false },
    select: { username: true, fullName: true, bio: true, image: true },
  });

  if (!user) {
    return { title: 'User not found' };
  }

  const title = user.fullName
    ? `${user.fullName} (@${user.username})`
    : `@${user.username}`;

  const description =
    user.bio || `See ${user.username}'s posts on Muted.`;

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

  // const image = user.image || `${APP_URL}/og-image.png` || `${APP_URL}/assets/muted-logo-blue.png`;

  const isClerkUrl = user.image?.includes('img.clerk.com') ||
    user.image?.includes('images.clerk.dev');

  const image = user.image && !isClerkUrl
    ? user.image
    : user.image && isClerkUrl
      ? `${APP_URL}/_next/image?url=${encodeURIComponent(user.image)}&w=400&q=75`
      : `${APP_URL}/og-image.png`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      images: [{ url: image, width: 400, height: 400 }],
      url: `${APP_URL}/@${user.username}`,
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [image],
    },
  };
}

const ProfilePage = ({ params }: { params: { username: string } }) => {
  const username = decodeURIComponent(params.username).substring(1);

  return <ProfileClient username={username} />;
};

export default ProfilePage;