import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import type { NextResponse } from "next/server";

export default authMiddleware({
  afterAuth(auth, req, evt) {
    console.log("Hello from middleware! @.@");

    // handle users who aren't authenticated
    // if (!auth.userId && !auth.isPublicRoute && ) {
    //   return redirectToSignIn({ returnBackUrl: req.url }) as NextResponse;
    // }
    // redirect them to the organization selection page
    // if (
    //   auth.userId &&
    //   !auth.orgId &&
    //   req.nextUrl.pathname !== "/org-selection"
    // ) {
    //   const orgSelection = new URL("/org-selection", req.url);
    //   return NextResponse.redirect(orgSelection);
    // }
  },
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
