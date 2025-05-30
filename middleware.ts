import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
} from "@/routes";
import { db } from "@/lib/db";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isOnboardingRoute = nextUrl.pathname === "/onboarding";

  if (isApiAuthRoute) {
    return null;
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL("/auth/loading", nextUrl));
    }
    return null;
  }

  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);

    return Response.redirect(
      new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}`, nextUrl)
    );
  }

  // Check if user has completed onboarding
  if (
    isLoggedIn &&
    !isOnboardingRoute &&
    !nextUrl.pathname.startsWith("/auth/loading")
  ) {
    const userId = req.auth?.user?.id;

    if (userId) {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { hasCompletedOnboarding: true },
      });

      if (
        user &&
        !user.hasCompletedOnboarding &&
        nextUrl.pathname !== "/onboarding"
      ) {
        return Response.redirect(new URL("/onboarding", nextUrl));
      }
    }
  }

  // Check if user has a workspace when logged in
  if (
    isLoggedIn &&
    !nextUrl.pathname.startsWith("/workspace/select") &&
    !nextUrl.pathname.startsWith("/auth/loading") &&
    !isOnboardingRoute
  ) {
    const userId = req.auth?.user?.id;

    if (userId) {
      const workspaceMember = await db.workspaceMember.findFirst({
        where: {
          userId: userId,
        },
      });

      // Only redirect to workspace/select if user has no workspaces
      if (!workspaceMember && !nextUrl.pathname.startsWith("/auth")) {
        return Response.redirect(new URL("/workspace/select", nextUrl));
      }
    }
  }

  return null;
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
