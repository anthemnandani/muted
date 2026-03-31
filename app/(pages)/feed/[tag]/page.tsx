import TopicFeedClient from './TopicFeedClient';
import { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { tag: string };
}): Promise<Metadata> {
  const tag = decodeURIComponent(params.tag);
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;
  const fallbackImage = `${APP_URL}/og-image.png`; 

  const title = `#${tag}`;
  const description = `Explore posts tagged #${tag} on Muted.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${APP_URL}/feed/${tag}`,
    },
    openGraph: {
      title: `${title} on Muted`,
      description,
      type: 'website',
      url: `${APP_URL}/feed/${tag}`,
      siteName: 'Muted',
      images: [
        {
          url: fallbackImage,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} on Muted`,
      description,
      images: [fallbackImage],
    },
  };
};

const TopicFeedPage = ({ params }: { params: { tag: string } }) => {
  return <TopicFeedClient tag={params.tag} />;
};

export default TopicFeedPage;