import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BLOOM 🌸',
  description: 'Track your days. Grow beautifully.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
