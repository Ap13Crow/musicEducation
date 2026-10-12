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
    default: 'My Music Coach — Make music part of your life',
    template: '%s | My Music Coach',
  },
  description:
    'Find your teacher, explore music courses and resources, discover inspiring events, and connect with musicians around the world.',
  keywords: ['music lessons', 'music teacher', 'online music courses', 'music education', 'concerts', 'sheet music'],
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
