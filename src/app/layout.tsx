// app/layout.tsx
import './globals.css';
import { Metadata } from 'next';
import { Header } from '@/components/ui/header';  // You will create this next
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'watchAI',
  description: 'Personalized video recommendations powered by AI and YouTube API.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body >
        <AuthProvider>
          <Header />
          <main>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
