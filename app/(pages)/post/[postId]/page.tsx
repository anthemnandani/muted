import { getPostMetadata } from '@/lib/actions/post.actions';
import { Metadata } from 'next';
import PostDetailsClient from './PostDetailsClient';

export async function generateMetadata({
  params,
}: {
  params: { postId: string };
}): Promise<Metadata> {
  const postId = params.postId;
  const postData = await getPostMetadata(postId);

  if (!postData) {
    return {
      title: 'Post not found',
      description: "This post doesn't exist or has been removed.",
    };
  }

  const description = postData.text
    ? postData.text.length > 160
      ? `${postData.text.substring(0, 157)}...`
      : postData.text
    : `Post by ${postData.author.fullName || postData.author.username}`;

  const image = postData.mediaUrl;

  const title = postData.text
    ? `${postData.author.username}: ${postData.text.substring(0, 50)}${
        postData.text.length > 50 ? '...' : ''
      }`
    : `${postData.author.username}'s post`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: [{ url: image! }],
      publishedTime: postData.createdAt.toISOString(),
      authors: [postData.author.fullName || postData.author.username],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image!],
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
