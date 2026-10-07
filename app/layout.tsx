import type { Metadata } from 'next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

export const metadata: Metadata = {
  title: "whatsforyou — Know what you're actually signing",
  description:
    'Private, instant offer-letter auditor for Indian freshers. Detect hidden bonds, probation cuts, variable pay risks, and calculate real monthly in-hand salary.',
  keywords: [
    'offer letter analyzer',
    'in hand salary calculator',
    'fresher job offer traps',
    'service agreement bond',
    'indian salary new tax regime',
    'notice period asymmetry',
  ],
  authors: [{ name: 'whatsforyou' }],
  metadataBase: new URL('https://whatsforyou.app'),
  openGraph: {
    title: "whatsforyou — Know what you're actually signing",
    description:
      'Upload your job offer letter. Spot hidden traps, compute exact monthly in-hand salary, and get negotiation questions in seconds.',
    url: 'https://whatsforyou.app',
    siteName: 'whatsforyou',
    images: [
      {
        url: '/api/og?score=78',
        width: 1200,
        height: 630,
        alt: 'whatsforyou Offer Auditor',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "whatsforyou — Know what you're actually signing",
    description:
      'Upload your job offer letter. Spot hidden traps, compute exact monthly in-hand salary, and get negotiation questions in seconds.',
    images: ['/api/og?score=78'],
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-paper text-ink min-h-screen flex flex-col font-sans selection:bg-paper-darker selection:text-ink">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
