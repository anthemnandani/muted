import NotFound from '@/app/not-found';
import { db } from '@/server/db';
import { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const page = await db.page.findUnique({
    where: { slug: params.slug },
    select: { title: true },
  });

  if (!page) return {};

  return {
    title: `${page.title} | Muted Social`,
  };
}

export default async function DynamicContentPage({
  params,
}: {
  params: { slug: string };
}) {
  const page = await db.page.findUnique({
    where: { slug: params.slug },
  });

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
