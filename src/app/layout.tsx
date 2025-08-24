import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/Header";
import {ClerkProvider} from '@clerk/nextjs'

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
    
    <ClerkProvider>


       <html lang="en">
        <body className={`${inter.className}`}>
        
             <Header/>
       
          <main className="min-h-screen "> {children}</main>

          <footer className="bg-blue-200 py-10">
            <div className="container mx-auto  px-4  text-center text-gray-600  ">
              <p>Made with 💞By Nilesh</p>
            </div>
          </footer>
        </body>
      </html>
  
    </ClerkProvider>

  );
}
