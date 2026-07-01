import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    template: '%s | Downtown Boutique',
    default: 'Downtown Boutique | Premium Fashion For Every Occasion',
  },
  description: "Discover the new standard of modern luxury menswear. Curated premium fashion, accessories, and essentials.",
  keywords: ["fashion", "menswear", "boutique", "luxury", "clothing", "downtown boutique"],
  openGraph: {
    title: 'Downtown Boutique | Premium Fashion',
    description: 'Discover the new standard of modern luxury menswear.',
    url: '/',
    siteName: 'Downtown Boutique',
    images: [
      {
        url: '/hero_bg.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Downtown Boutique | Premium Fashion',
    description: 'Discover the new standard of modern luxury menswear.',
    images: ['/hero_bg.png'],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import ClientLayoutWrapper from "../components/ClientLayoutWrapper";
import { CartProvider } from "../context/CartContext";
import { AuthProvider } from "../context/AuthContext";
import { AdminAuthProvider } from "../context/AdminAuthContext";
import { WishlistProvider } from "../context/WishlistContext";
import { NotificationsProvider } from "../context/NotificationsContext";
import { CustomerNotificationsProvider } from "../context/CustomerNotificationsContext";
import { RealtimeStockProvider } from "../context/RealtimeStockContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

import WhatsAppButton from "../components/WhatsAppButton";
import FaqButton from "../components/FaqButton";
import { AIStylistProvider } from "../context/AIStylistContext";

import { RealtimeSettingsProvider } from "../context/RealtimeSettingsContext";
import { LoadingProvider } from "../context/LoadingContext";

export default function RootLayout({ children }) {
  console.log("GOOGLE_CLIENT_ID loaded:", process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
      style={{ backgroundColor: '#0B0B0B' }}
    >
      <head>
        <style dangerouslySetInnerHTML={{__html: `
          html, body, #__next, #root {
            background-color: #0B0B0B !important;
            margin: 0;
            padding: 0;
          }
        `}} />
      </head>
      <body className="min-h-full flex flex-col" style={{ backgroundColor: '#0B0B0B', margin: 0 }}>
        <div style={{ overflowX: 'hidden', width: '100%', position: 'relative', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "placeholder_id"}>
            <AdminAuthProvider>
              <AuthProvider>
                <CustomerNotificationsProvider>
                  <NotificationsProvider>
                    <RealtimeStockProvider>
                      <RealtimeSettingsProvider>
                        <CartProvider>
                          <AIStylistProvider>
                            <WishlistProvider>
                              <LoadingProvider>
                                <ClientLayoutWrapper>
                                  {children}
                                </ClientLayoutWrapper>
                                <FaqButton />
                                <WhatsAppButton />
                              </LoadingProvider>
                            </WishlistProvider>
                          </AIStylistProvider>
                        </CartProvider>
                      </RealtimeSettingsProvider>
                    </RealtimeStockProvider>
                  </NotificationsProvider>
                </CustomerNotificationsProvider>
              </AuthProvider>
            </AdminAuthProvider>
          </GoogleOAuthProvider>
        </div>
      </body>
    </html>
  );
}
