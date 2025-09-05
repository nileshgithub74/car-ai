// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center bg-rose-100/90">
      <h1 className="text-7xl font-extrabold mb-6 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
        404
      </h1>
      <h2 className="text-3xl font-semibold mb-4 bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
        Page Not Found
      </h2>
      <p className="text-lg text-gray-600 mb-8">
        Oops! The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300"
      >
        Go Back Home
      </Link>
    </div>
  );
}
