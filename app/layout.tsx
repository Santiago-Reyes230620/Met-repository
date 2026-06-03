import '@/app/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MET Prep - Michigan English Test Preparation',
  description: 'Master the Michigan English Test with comprehensive grammar, vocabulary, reading exercises, and practice quizzes. Build your skills and confidence for exam success.',
  keywords: ['MET', 'Michigan English Test', 'English exam', 'grammar', 'vocabulary', 'reading comprehension', 'test prep'],
  authors: [{ name: 'MET Prep' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://metprep.example.com',
    siteName: 'MET Prep',
    title: 'MET Prep - Michigan English Test Preparation',
    description: 'Master the Michigan English Test with comprehensive grammar, vocabulary, reading exercises, and practice quizzes.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MET Prep - Michigan English Test Preparation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MET Prep - Michigan English Test Preparation',
    description: 'Master the Michigan English Test with comprehensive practice exercises.',
    creator: '@metprep',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
