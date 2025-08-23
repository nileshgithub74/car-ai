import Image from "next/image";
import Link from "next/link";
import Logo from "../../../public/logo.png";

import { Button } from "@/components/ui/button";
import { CarFront } from "lucide-react";

const Header = async ({ isAdminPage = false }) => {
  const isAdmin = false;

  return (
    <header className="fixed top-0 bg-white/80 backdrop-blur-md z-50 border-b w-full">
      <nav className="mx-auto px-4 py-4 flex items-center justify-between space-x-4 bg-gray-200/50 backdrop-blur-2xl shadow-xl">
        {/* Left side Logo */}
        <Link href={isAdminPage ? "/admin" : "/"}>
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

       <Link href="/sign-in"><button className="border rounded-xl p-3 mr-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 text-white shadow-lg hover:from-pink-500 hover:via-red-400 hover:to-cyan-400 hover:shadow-xl transition duration-300 ease-in-out">Login</button></Link>

      </nav>
    </header>
  );
};

export default Header;
