import { FileType } from '@/generated/prisma/enums';
import { getPostMetadata } from '@/lib/actions/post.actions';
import { Metadata } from 'next';
import PostDetailsClient from './PostDetailsClient';

export async function generateMetadata({
  params,
}: {
  params: { postId: string };
}): Promise<Metadata> {
  const postData = await getPostMetadata(params.postId);
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

  if (!postData) {
    return {
      title: 'Post not found',
      description: "This post doesn't exist or has been removed.",
    };
  }

  const authorName = postData.author.fullName || postData.author.username;

  const image = postData.mediaUrl
    ? postData.mediaUrl.startsWith('http')
      ? postData.mediaUrl
      : `${APP_URL}${postData.mediaUrl}`
    : null;

  const isVideo = postData.mediaType === FileType.VIDEO;

  const description = postData.text
    ? postData.text.length > 160
      ? `${postData.text.substring(0, 157)}...`
      : postData.text
    : `Post by ${authorName} on Muted`;

  const title = postData.text
    ? `${postData.text.substring(0, 60)}${
        postData.text.length > 60 ? '...' : ''
      } — ${authorName} on Muted`
    : `${authorName}'s post on Muted`;

  const url = `${APP_URL}/post/${params.postId}`;

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

      publishedTime: postData.createdAt.toISOString(),
      authors: [authorName],

      ...(isVideo && {
        video: {
          url: image,
          type: 'video/mp4',
          width: 1280,
          height: 720,
        },
      }),
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,
      // images: [image],
      ...(image ? { images: [image] } : {}),
      creator: `@${postData.author.username}`,
    },
  };
}

export default function PostDetails({
  params,
}: {
  params: { postId: string };
}) {
  return <PostDetailsClient postId={params.postId} />;
}
