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
  title: "Downtown Boutique",
  description: "Premium Fashion For Every Occasion",
};

import ClientLayoutWrapper from "../components/ClientLayoutWrapper";
import { CartProvider } from "../context/CartContext";
import { AuthProvider } from "../context/AuthContext";
import { WishlistProvider } from "../context/WishlistContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function RootLayout({ children }) {
  console.log("GOOGLE_CLIENT_ID loaded:", process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "placeholder_id"}>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <ClientLayoutWrapper>
                  {children}
                </ClientLayoutWrapper>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
