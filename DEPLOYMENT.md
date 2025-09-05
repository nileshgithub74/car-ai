# Deployment Guide

## Vercel Deployment Fix

This project has been configured to resolve the Prisma Client generation issue on Vercel.

### Changes Made:

1. **Updated package.json scripts:**
   - Added `prisma generate` to the build script
   - Added `postinstall` script to generate Prisma Client after dependency installation

2. **Fixed environment variable handling:**
   - Made ARCJET_KEY optional (middleware will work without it)
   - Made GEMINI_API_KEY optional (AI features will gracefully fail)
   - Updated error handling to return errors instead of throwing during build

3. **Required Environment Variables for Vercel:**
   ```
   DATABASE_URL=your-database-url
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-key
   CLERK_SECRET_KEY=your-clerk-secret
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key
   ```

4. **Optional Environment Variables:**
   ```
   ARCJET_KEY=your-arcjet-key (for security features)
   GEMINI_API_KEY=your-gemini-key (for AI car analysis)
   ```

### Deployment Steps:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add the required environment variables in Vercel dashboard
4. Deploy - the build should now succeed

### Build Process:
The build now runs `prisma generate` before `next build`, ensuring the Prisma Client is available during the build process on Vercel's cached environment.
