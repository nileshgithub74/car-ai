import arcjet, { createMiddleware, detectBot, shield } from "@arcjet/next";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/saved-cars(.*)",
  "/reservations(.*)",
]);

// Create Arcjet middleware - only if key is available
const aj = process.env.ARCJET_KEY ? arcjet({
  key: process.env.ARCJET_KEY,
  // characteristics: ["userId"], // Track based on Clerk userId
  rules: [
    // Shield protection for content and security
    shield({
      mode: "LIVE",
    }),
    detectBot({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
        // See the full list at https://arcjet.com/bot-list
      ],
    }),
  ],
}) : null;

// Create base Clerk middleware
const clerk = clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (!userId && isProtectedRoute(req)) {
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }

  return NextResponse.next();
});

// Chain middlewares - ArcJet runs first (if available), then Clerk
export default aj ? createMiddleware(aj, clerk) : clerk;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
