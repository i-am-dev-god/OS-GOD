import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OS-GOD — Knowledge Work OS',
  description: 'A text-first, database-native knowledge and work operating system. Local-first, GitHub sign-in, portable by design.',
  applicationName: 'OS-GOD',
  referrer: 'strict-origin-when-cross-origin',
  icons: { icon: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/icon.svg` },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f7fb' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0c12' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
