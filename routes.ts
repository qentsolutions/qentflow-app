import { currentUser } from "@/lib/auth";
import { getUserWorkspaces } from "./actions/workspace";

/**
 * An array of routes that are accessible to the public
 * These routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes = [
  "/auth/new-verification",
  "/terms-of-use",
  "/privacy-policy",
];

/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in users to /server
 * @type {string[]}
 */
export const authRoutes = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/error",
  "/auth/reset",
  "/auth/new-password",
];

/**
 * The prefix for API authentication routes
 * Routes that start with this prefix are used for API authentication purposes
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth";

/**
 * The default redirect path after logging in
 * @type {string}
 */
export const getDefaultLoginRedirect = async () => {
  const user = await currentUser();
  if (!user) return "/auth/login";

  // Check if user has completed onboarding
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/user/me`
  );
  const userData = await response.json();

  if (!userData.hasCompletedOnboarding) {
    return "/onboarding";
  }

  const { workspaces } = await getUserWorkspaces();
  if (!workspaces || workspaces.length === 0) {
    return "/workspace/select";
  }

  return `/${workspaces[0].id}/home`;
};

export const DEFAULT_LOGIN_REDIRECT = "/auth/loading";
