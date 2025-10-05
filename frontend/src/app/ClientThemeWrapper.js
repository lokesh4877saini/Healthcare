'use client';

import { useTheme } from '@/context/ThemeContext';

export default function ClientThemeWrapper({ children }) {
  const { theme } = useTheme();

  return (
    <div data-theme={theme}>
      {children}
    </div>
  );
}
