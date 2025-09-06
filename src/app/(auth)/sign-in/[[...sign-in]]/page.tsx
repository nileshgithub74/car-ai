"use client";

import { SignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignInPage() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.replace("/"); // redirect already signed-in users
    }
  }, [isSignedIn, router]);

  if (isSignedIn) return null; // prevent rendering <SignIn />

  return <SignIn />;
}
