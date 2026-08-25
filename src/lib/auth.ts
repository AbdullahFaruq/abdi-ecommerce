import "server-only";

import { auth, clerkClient } from "@clerk/nextjs/server";

/**
 * Authorization model
 * -------------------
 * A user is an admin when their Clerk **publicMetadata.role** equals "admin".
 * publicMetadata is writable only from the Clerk backend API (dashboard or a
 * secret-key call), never from the browser, so a signed-in user cannot grant
 * themselves the role.
 *
 * The role is read from Clerk's API on the server for every protected call —
 * hiding admin links in the UI is cosmetic only. Every mutating route handler
 * calls `requireAdmin()` before touching the database.
 */

export type SessionUser = { userId: string; isAdmin: boolean };

export async function getCurrentUser(): Promise<SessionUser | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = (user.publicMetadata as { role?: string } | undefined)?.role;

  return { userId, isAdmin: role === "admin" };
}

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return Boolean(user?.isAdmin);
}

/** Thrown by `requireAdmin`; mapped to a 401/403 by `handleRouteError`. */
export class AuthorizationError extends Error {
  status: 401 | 403;
  constructor(status: 401 | 403, message: string) {
    super(message);
    this.name = "AuthorizationError";
    this.status = status;
  }
}

/** Use at the top of every admin-only route handler / server action. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthorizationError(401, "Sign in to continue.");
  if (!user.isAdmin) throw new AuthorizationError(403, "Admin access required.");
  return user;
}
