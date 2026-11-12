import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portal Login & Pendaftaran Member (Opsional) | Bengkel Las Besi Bandung Barat',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

