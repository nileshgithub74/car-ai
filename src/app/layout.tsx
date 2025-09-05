import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/Header";
import {ClerkProvider} from '@clerk/nextjs'
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vehicle",
  description: "Find Your's Dream Vehicle",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <ClerkProvider>
          <Header/>
          <main className="min-h-screen"> {children}</main>
          <Toaster richColors/>
          
          <footer className="bg-blue-200 py-6">
            <div className="container mx-auto px-4 text-center text-gray-700">
              <p>Made with 💞 by Nilesh</p>
              <p className="mt-2 text-sm">&copy; 2024 Vehiql. All Rights Reserved.</p>
            </div>
          </footer>
        </ClerkProvider>
      </body>
    </html>
  );
}
