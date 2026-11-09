import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { CompareProvider } from '@/context/CompareContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CralyAiFab from '@/components/CralyAiFab';
import CompareDock from '@/components/CompareDock';
import { BRAND } from '@/config/brand';

export const metadata: Metadata = {
  title: BRAND.meta.title,
  description: BRAND.meta.description,
  keywords: BRAND.meta.keywords,
  authors: [{ name: BRAND.name }],
  icons: {
    icon: BRAND.logoIcon,
    apple: BRAND.logoIcon,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <CompareProvider>
                <Header />
                <main style={{ flex: 1, paddingTop: '74px' }}>{children}</main>
                <CompareDock />
                <CralyAiFab />
                <Footer />
              </CompareProvider>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
