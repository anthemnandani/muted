import NotFound from '@/app/not-found';
import { getPublicPage } from '@/lib/actions/page.actions';
import { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const page = await getPublicPage(params.slug);

  if (!page) return {};

  // Strip HTML tags for description
  const plainText = page.content.replace(/<[^>]*>/g, '');

  const description =
    plainText.length > 160
      ? `${plainText.substring(0, 157)}...`
      : plainText;

  return {
    title: `${page.title} | Muted`,
    description,
    openGraph: {
      title: `${page.title} | Muted`,
      description,
      type: 'article',
    },
  };
}

export default async function DynamicContentPage({
  params,
}: {
  params: { slug: string };
}) {
  const page = await getPublicPage(params.slug);

  if (!page) {
    return <NotFound />;
  }

  return (
    <div
      className='prose prose-invert max-w-none prose-headings:text-white/90 prose-a:text-primary-blue hover:prose-a:text-primary-blue/80 prose-table:border-white/20 prose-th:bg-white/5'
      dangerouslySetInnerHTML={{ __html: page.content }}
    />
  );
}