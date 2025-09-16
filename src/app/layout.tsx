import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/Header";
import {ClerkProvider} from '@clerk/nextjs'
import { Toaster } from "sonner";
import { checkUser } from "@/lib/checkUser";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vehicle",
  description: "Find Your's Dream Vehicle",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hasClerkEnv = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !!process.env.CLERK_SECRET_KEY;
  if (hasClerkEnv) {
    // Ensure the authenticated Clerk user exists in our database
    await checkUser();
  }
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        {hasClerkEnv ? (
          <ClerkProvider
            publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
            signInUrl="/sign-in"
            signUpUrl="/sign-up"
          >
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
        ) : (
          <>
            <Header/>
            <main className="min-h-screen"> {children}</main>
            <Toaster richColors/>
            <footer className="bg-blue-200 py-6">
              <div className="container mx-auto px-4 text-center text-gray-700">
                <p>Made with 💞 by Nilesh</p>
                <p className="mt-2 text-sm">&copy; 2024 Vehiql. All Rights Reserved.</p>
              </div>
            </footer>
          </>
        )}
      </body>
    </html>
  );
}
