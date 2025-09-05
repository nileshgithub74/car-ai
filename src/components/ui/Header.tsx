import Image from "next/image";
import Link from "next/link";
import Logo from "../../../public/logo.png";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "./button";
import { ArrowLeft, CarFront, Heart, Layout } from "lucide-react";
import { checkUser } from "@/lib/checkUser";

const Header = async ({ isAdminPage = false }) => {
  const user = await checkUser();

  const isAdmin = user?.role === "ADMIN";

  return (
    <header className="fixed top-0 bg-rose-100/50 backdrop-blur-md z-50 border-b w-full ">
      <nav className="mx-auto px-4 py-4 flex items-center justify-between space-x-4 bg-gray-200/50 backdrop-blur-2xl shadow-xl">
        <Link href={isAdminPage ? "/admin" : "/"} className="flex">
          <Image
            src={Logo}
            alt="Logo"
            width={100}
            height={40}
            className="h-12 w-auto object-contain space-x-2"
          />
          {isAdminPage && (
            <span className="text-xs font-extralight"></span>
          )}
        </Link>

        <div className="flex items-center space-x-4">
          {isAdmin ? (
            <>
               {/* ✅ Saved Cars also visible for admin */}
              <Link href="/saved-cars">
                <Button>
                  <Heart size={18} />
                  <span className="hidden md:inline">Saved Cars</span>
                </Button>
              </Link>
              {/* ✅ If Admin: Always show Admin Portal */}
              <Link href="/admin">
                <Button variant="outline" className="flex items-center gap-2">
                  <Layout size={18} />
                  <span className="hidden md:inline">Admin Portal</span>
                </Button>
              </Link>

              {/* ✅ If on Admin Page → show Back to Apps */}
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
              {/*  Non-admin: Saved Cars + My Reservations */}
              <Link href="/saved-cars">
                <Button>
                  <Heart size={18} />
                  <span className="hidden md:inline">Saved Cars</span>
                </Button>
              </Link>

              <Link href="/reservations">
                <Button variant="outline">
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
                  avatarBox: "w-20 h-20",
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
