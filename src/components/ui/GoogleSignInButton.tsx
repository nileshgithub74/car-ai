'use client';

interface GoogleSignInButtonProps {
  onClick?: () => void;
  className?: string;
}

export default function GoogleSignInButton({ onClick, className }: GoogleSignInButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full py-3 rounded-xl bg-gradient-to-r from-red-400 via-pink-500 to-red-600 text-white font-semibold shadow-lg hover:from-red-500 hover:via-pink-600 hover:to-red-700 hover:shadow-xl transition duration-300 ease-in-out ${className ?? ''}`}
    >
      Sign in with Google
    </button>
  );
}
