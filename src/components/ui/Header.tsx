"use client";

import Image from "next/image";
import Link from "next/link";
import Logo from "../../../public/logo.png";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "./button";
import { ArrowLeft, CarFront, Heart, Layout } from "lucide-react";

const Header = ({ isAdminPage = false }) => {
  const isAdmin = false;

  return (
    <header className="fixed top-0 bg-white/50 backdrop-blur-md z-50 border-b w-full">
      <nav className="mx-auto px-4 py-4 flex items-center justify-between space-x-4 bg-gray-200/50 backdrop-blur-2xl shadow-xl">
        <Link href={isAdminPage ? "/admin" : "/"} className="flex">
          <Image
            src={Logo}
            alt="Logo"
            width={200}
            height={60}
            className="h-12 w-auto object-contain space-x-2"
          />
          {isAdminPage && (
            <span className="text-xs font-extralight">admin</span>
          )}
        </Link>

        <div className="flex items-center space-x-4">
          {isAdmin ? (
            <>
              <Link href="/">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft size={18} />
                  <span className="hidden md:inline"> Back to Apps</span>
                </Button>
              </Link>
            </>
          ) : (
            <SignedIn>
              <Link href="/saved-cars">
                <Button>
                  <Heart size={18} />
                  <span className="hidden md:inline"> Saved Cars</span>
                </Button>
              </Link>

              {!isAdmin ? (
                <Link href="/reversations">
                  <Button variant="outline">
                    <CarFront size={18} />
                    <span className="hidden md:inline"> My reservations</span>
                  </Button>
                </Link>
              ) : (
                <Link href="/admin">
                  <Button variant="outline">
                    <Layout size={18} />
                    <span className="hidden md:inline"> Admin portal</span>
                  </Button>
                </Link>
              )}
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
              elements:{
                avatarBox:'w-20 h-20',
              }
            }}
             />
          </SignedIn>
        </div>
      </nav>
    </header>  
  );
};

export default Header;
