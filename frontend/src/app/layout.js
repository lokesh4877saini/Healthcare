// src/app/layout.js
import '@/styles/globals.css';
import { AuthProvider } from '@/context/AuthProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingChat from '@/components/FloatingChat';
import { ScreenProvider } from '@/context/ScreenProvider';

export const metadata = {
  title: 'Healthcare App',
  description: 'healthcare booking app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ScreenProvider>
            <Navbar />
            <main>{children}</main>
            <FloatingChat />
            <Footer />
          </ScreenProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
