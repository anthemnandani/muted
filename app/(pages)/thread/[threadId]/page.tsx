import { FileType } from '@/generated/prisma/enums';
import { getThreadMetadata } from '@/lib/actions/thread.actions';
import { Metadata } from 'next';
import ThreadInfoClient from './ThreadInfoClient';

export async function generateMetadata({
  params,
}: {
  params: { threadId: string };
}): Promise<Metadata> {
  const threadData = await getThreadMetadata(params.threadId);
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

  if (!threadData) {
    return {
      title: 'Thread not found',
      description: "This thread doesn't exist or has been removed.",
    };
  }

  const authorName = threadData.author.fullName || threadData.author.username;

  const image = threadData.mediaUrl
    ? threadData.mediaUrl.startsWith('http')
      ? threadData.mediaUrl
      : `${APP_URL}${threadData.mediaUrl}`
    : null;

  const isVideo = threadData.mediaType === FileType.VIDEO;

  const description = threadData.text
    ? threadData.text.length > 160
      ? `${threadData.text.substring(0, 157)}...`
      : threadData.text
    : `Thread by ${authorName} on Muted`;

  const title = threadData.text
    ? `${threadData.text.substring(0, 60)}${
        threadData.text.length > 60 ? '...' : ''
      } — ${authorName} on Muted`
    : `${authorName}'s thread on Muted`;

  const url = `${APP_URL}/thread/${params.threadId}`;

  return {
    title,
    description,

    alternates: {
      canonical: url,
    },

    openGraph: {
      title,
      description,
      url,
      siteName: 'Muted',
      type: isVideo ? 'video.other' : 'article',

      // images: [
      //   {
      //     url: image,
      //     width: 1200,
      //     height: 630,
      //     alt: title,
      //   },
      // ],

      ...(image
        ? {
            images: [
              {
                url: image,
                width: 1200,
                height: 630,
                alt: title,
              },
            ],
          }
        : {}),

      publishedTime: threadData.createdAt.toISOString(),
      authors: [authorName],

      // ...(isVideo && {
      //   video: {
      //     url: image,
      //     type: 'video/mp4',
      //     width: 1280,
      //     height: 720,
      //   },
      // }),

      ...(isVideo && image
        ? {
            video: {
              url: image,
              type: 'video/mp4',
              width: 1280,
              height: 720,
            },
          }
        : {}),
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image ? { images: [image] } : {}),
      creator: `@${threadData.author.username}`,
    },
  };
}

export default function ThreadInfoPage({
  params,
}: {
  params: { threadId: string };
}) {
  return <ThreadInfoClient id={params.threadId} />;
}
