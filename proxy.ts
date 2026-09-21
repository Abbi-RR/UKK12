import { NextRequest, NextResponse } from "next/server";
import {
  isRecord,
  requestCoworkingProfile,
  type CoworkingApiPayload,
  type CoworkingUserRole,
} from "./lib/coworking-api";

const ACCESS_TOKEN_COOKIE = "coworking_access_token";
const MEMBER_DASHBOARD = "/member/booking";
const ADMIN_DASHBOARD = "/admin";

function getRoleFromProfile(payload: CoworkingApiPayload): CoworkingUserRole | undefined {
  if (!isRecord(payload.data)) {
    return undefined;
  }

  const role = payload.data.role;
  return role === "member" || role === "admin_space" ? role : undefined;
}

function redirectTo(request: NextRequest, pathname: string, clearToken = false) {
  const response = NextResponse.redirect(new URL(pathname, request.url));

  if (clearToken) {
    response.cookies.delete(ACCESS_TOKEN_COOKIE);
  }

  return response;
}

function isPublicPage(pathname: string) {
  return pathname === "/login" || pathname === "/register";
}

function isMemberRoute(pathname: string) {
  return pathname === "/member" || pathname.startsWith("/member/");
}

function isAdminRoute(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = isMemberRoute(pathname) || isAdminRoute(pathname);
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (pathname === "/") {
    return NextResponse.next();
  }

  if (!isProtectedRoute && !isPublicPage(pathname)) {
    return NextResponse.next();
  }

  if (!accessToken) {
    return isProtectedRoute ? redirectTo(request, "/login") : NextResponse.next();
  }

  let role: CoworkingUserRole | undefined;

  try {
    const profile = await requestCoworkingProfile(accessToken);
    role = profile.status >= 200 && profile.status < 300 ? getRoleFromProfile(profile.payload) : undefined;
  } catch {
    role = undefined;
  }

  if (!role) {
    return isProtectedRoute
      ? redirectTo(request, "/login", true)
      : NextResponse.next();
  }

  if (pathname === "/login" || pathname === "/register") {
    return redirectTo(request, role === "member" ? MEMBER_DASHBOARD : ADMIN_DASHBOARD);
  }

  if (isMemberRoute(pathname) && role !== "member") {
    return redirectTo(request, ADMIN_DASHBOARD);
  }

  if (isAdminRoute(pathname) && role !== "admin_space") {
    return redirectTo(request, MEMBER_DASHBOARD);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
