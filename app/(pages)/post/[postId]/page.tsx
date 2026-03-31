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
  const fallbackImage = `${APP_URL}/og-image.png`; // Null-safe fallback

  if (!postData) {
    return {
      title: 'Post not found',
      description: "This post doesn't exist or has been removed.",
    };
  }

  // Author name
  const authorName = postData.author.fullName || postData.author.username;

  // Use post media if exists, else fallback image
  const image = postData.mediaUrl || fallbackImage;

  // Check if post is a video
  const isVideo = postData.mediaType === 'VIDEO';

  // Description (truncated to 160 chars)
  const description = postData.text
    ? postData.text.length > 160
      ? `${postData.text.substring(0, 157)}...`
      : postData.text
    : `Post by ${authorName} on Muted`;

  // Title includes author for SEO
  const title = postData.text
    ? `${postData.text.substring(0, 60)}${postData.text.length > 60 ? '...' : ''} — ${authorName} on Muted`
    : `${authorName}'s post on Muted`;

  return {
    title,
    description,
    alternates: {
      canonical: `${APP_URL}/post/${params.postId}`, // canonical URL
    },
    openGraph: {
      title,
      description,
      type: isVideo ? 'video.other' : 'article', // video-specific OG type
      images: [{ url: image, width: 1200, height: 630 }],
      url: `${APP_URL}/post/${params.postId}`,
      publishedTime: postData.createdAt.toISOString(),
      authors: [authorName],
      siteName: 'Muted',
      ...(isVideo && {
        video: {
          url: image, // assuming mediaUrl is video link
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
      images: [image],
      creator: `@${postData.author.username}`,
    },
  };
}

// Functional component remains unchanged
export default function PostDetails({
  params,
}: {
  params: { postId: string };
}) {
  return <PostDetailsClient postId={params.postId} />;
}