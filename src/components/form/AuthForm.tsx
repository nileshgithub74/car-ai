'use client';

import { ReactNode } from 'react';
import GoogleSignInButton from '../ui/GoogleSignInButton';
import Link from 'next/link';

interface AuthFormWrapperProps {
  title: string;
  children: ReactNode;
  linkText: string;
  linkHref: string;
  submitButtonText: string;
  showGoogleButton?: boolean;
  onSubmit?: () => void;
}

export default function AuthFormWrapper({
  title,
  children,
  linkText,
  linkHref,
  submitButtonText,
  showGoogleButton = true,
  onSubmit,
}: AuthFormWrapperProps) {
  return (
    <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow">
      <h1 className="text-2xl font-bold text-center mb-6">{title}</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        {children}

        {/* Submit Button with gradient */}
        <button
          type="submit"
          className="w-full mt-4 border rounded-xl px-5 py-3 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 text-white font-semibold shadow-lg hover:from-pink-500 hover:via-red-400 hover:to-cyan-400 hover:shadow-xl transition duration-300 ease-in-out"
        >
          {submitButtonText}
        </button>
      </form>

      {showGoogleButton && (
        <>
          {/* Divider */}
          <div className="flex items-center my-4 gap-2">
            <span className="h-px flex-1 bg-gray-300"></span>
            <span className="text-gray-500 text-sm">or</span>
            <span className="h-px flex-1 bg-gray-300"></span>
          </div>

          {/* Google Sign-In */}
          <GoogleSignInButton onClick={() => console.log('Google Sign In')} />
        </>
      )}

      {/* Bottom link */}
      <p className="text-center text-sm text-gray-600 mt-4">
        {linkText}{' '}
        <Link className="text-blue-500 hover:underline font-medium" href={linkHref}>
          {linkHref.includes('sign-up') ? 'Sign up' : 'Sign in'}
        </Link>
      </p>
    </div>
  );
}
