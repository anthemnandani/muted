import PageEditorClient from './PageEditorClient';

export default function PageEditor({ params }: { params: { slug: string } }) {
  return <PageEditorClient slug={params.slug} />;
}
