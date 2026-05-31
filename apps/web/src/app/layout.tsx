import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { ApolloWrapper } from '@/lib/apollo-provider';
import { AuthProvider } from '@/lib/auth-provider';
import Navbar from '@/components/Navbar';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: {
    default: 'MusicEdu — Classical Music Education Platform',
    template: '%s | MusicEdu',
  },
  description:
    'Learn classical music through theory courses, live lessons with certified teachers, and discover performances near you.',
  keywords: ['classical music', 'music education', 'online lessons', 'music theory'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-white font-sans antialiased">
        <AuthProvider>
          <ApolloWrapper>
            <Navbar />
            {children}
          </ApolloWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
