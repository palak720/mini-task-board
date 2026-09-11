import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mini Task Board',
  description: 'A small full-stack task board built with Next.js and MySQL.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}