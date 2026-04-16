import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Food Delivery App",
  description: "What are you craving today?",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#F8F5F1] text-[#5c4033] min-h-screen antialiased`}>
        {/* Navbar will go here later */}
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}