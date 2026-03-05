import LegalSidebar from '@/components/sidebars/LegalSidebar';
import { getAllPublicPages } from '@/lib/actions/page.actions';

export default async function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pages = await getAllPublicPages();
  return (
    <div className='flex flex-col md:flex-row min-h-screen'>
      <LegalSidebar pages={pages} />

      <div className='flex-1 w-full'>{children}</div>
    </div>
  );
}
