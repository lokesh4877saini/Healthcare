// src/app/layout.js
import '@/styles/globals.css';
import { AuthProvider } from '@/context/AuthProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ToastContainer } from 'react-toastify'
import FloatingChat from '@/components/FloatingChat';
import { ScreenProvider } from '@/context/ScreenProvider';
import '../styles/customeToast.css';
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
            <ToastContainer position="bottom-center" autoClose={1500} hideProgressBar={true}/>
            <main>{children}</main>
            <FloatingChat />
            <Footer />
          </ScreenProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
