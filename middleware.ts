export { default } from "next-auth/middleware";

/**
 * Protect everything under /admin EXCEPT the login page.
 * NextAuth redirects unauthenticated requests to /admin/login (pages.signIn).
 */
export const config = {
  matcher: ["/admin/((?!login).*)", "/admin"],
};
