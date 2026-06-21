import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tandrust AI — Doctor se shuru hone wala fitness coach',
  description:
    "AI-powered Hindi fitness coach that starts from your doctor's visit. Real-time camera form correction, on-device only.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
