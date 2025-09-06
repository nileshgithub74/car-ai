"use client"; // important for SignedIn/SignedOut to work

import Image from "next/image";
import Link from "next/link";
import Logo from "../../../public/logo.png";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "./button";
import { ArrowLeft, CarFront, Heart, Layout } from "lucide-react";

const Header = ({ isAdminPage = false }) => {
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === "ADMIN";

  return (
    <header className="fixed top-0 bg-rose-100/50 backdrop-blur-md z-50 border-b w-full">
      <nav className="mx-auto px-4 py-4 flex items-center justify-between space-x-4 bg-gray-200/50 backdrop-blur-2xl shadow-xl">
        <Link href={isAdminPage ? "/admin" : "/"} className="flex items-center">
          <Image src={Logo} alt="Logo" width={100} height={40} className="h-12 w-auto object-contain" />
        </Link>

        <div className="flex items-center space-x-4">
          {isAdmin ? (
            <>
              <Link href="/saved-cars">
                <Button>
                  <Heart size={18} />
                  <span className="hidden md:inline">Saved Cars</span>
                </Button>
              </Link>

              <Link href="/admin">
                <Button variant="outline" className="flex items-center gap-2">
                  <Layout size={18} />
                  <span className="hidden md:inline">Admin Portal</span>
                </Button>
              </Link>

              {isAdminPage && (
                <Link href="/">
                  <Button variant="outline" className="flex items-center gap-2">
                    <ArrowLeft size={18} />
                    <span className="hidden md:inline">Back to Apps</span>
                  </Button>
                </Link>
              )}
            </>
          ) : (
            <SignedIn>
              <Link href="/saved-cars">
                <Button>
                  <Heart size={18} />
                  <span className="hidden md:inline">Saved Cars</span>
                </Button>
              </Link>

              <Link href="/reservations">
                <Button variant="outline" className="flex items-center gap-2">
                  <CarFront size={18} />
                  <span className="hidden md:inline">My Reservations</span>
                </Button>
              </Link>
            </SignedIn>
          )}

          <SignedOut>
            <SignInButton>
              <Button variant="outline">Login</Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
};

export default Header;
