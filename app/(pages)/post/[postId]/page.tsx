import { getPostMetadata } from '@/lib/actions/post.actions';
import { Metadata } from 'next';
import PostDetailsClient from './PostDetailsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: { postId: string };
}): Promise<Metadata> {
  try {
    const postData = await getPostMetadata(params.postId);

    const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;
    const fallbackImage = `${APP_URL}/og-image.png`;

    if (!postData) {
      return {
        title: 'Post not found',
        description: "This post doesn't exist or has been removed.",
      };
    }

    const authorName =
      postData.author.fullName || postData.author.username;

    const image = postData.mediaUrl
      ? postData.mediaUrl.startsWith('http')
        ? postData.mediaUrl
        : `${APP_URL}${postData.mediaUrl}`
      : fallbackImage;

    const title = postData.text
      ? `${postData.text.substring(0, 60)}${
          postData.text.length > 60 ? '...' : ''
        } — ${authorName} on Muted`
      : `${authorName}'s post on Muted`;

    const description = postData.text || `Post by ${authorName} on Muted`;

    const url = `${APP_URL}/post/${params.postId}`;

    return {
      title,
      description,
      alternates: { canonical: url },

      openGraph: {
        title,
        description,
        url,
        siteName: 'Muted',
        type: 'article',
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
          },
        ],
      },

      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
    };
  } catch (error) {
    return {
      title: 'Muted',
      description: 'Post preview',
    };
  }
}

// ✅ Page Component
export default function PostDetails({
  params,
}: {
  params: { postId: string };
}) {
  return <PostDetailsClient postId={params.postId} />;
}