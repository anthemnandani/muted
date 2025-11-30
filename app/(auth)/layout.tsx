import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Auth',
  description:
    'Muted is a social media platform for sharing thoughts and ideas',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
