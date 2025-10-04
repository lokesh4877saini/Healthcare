'use client';

import { useTheme } from '@/context/ThemeContext';
import '@/styles/globals.css';  // global styles

export default function ThemeLayout({ children }) {
  const { theme } = useTheme();
  return (
    <html lang="en" data-theme={theme}>
      <body>{children}</body>
    </html>
  );
}
