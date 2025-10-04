import '@/styles/globals.css';
import { AuthProvider } from '@/context/AuthProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingChat from '@/components/FloatingChat';
import { ScreenProvider } from '@/context/ScreenProvider';
import { ThemeProvider } from '@/context/ThemeContext';
import ClientThemeWrapper from './ClientThemeWrapper';

export const metadata = {
  title: 'Healthcare App',
  description: 'healthcare booking app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <ClientThemeWrapper>
            <AuthProvider>
              <ScreenProvider>
                <Navbar />
                <main>{children}</main>
                <FloatingChat />
                <Footer />
              </ScreenProvider>
            </AuthProvider>
          </ClientThemeWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
