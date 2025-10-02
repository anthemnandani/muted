import AdminSidebar from '@/components/sidebars/AdminSidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
