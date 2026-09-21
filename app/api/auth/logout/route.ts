import { NextResponse } from "next/server";

const ACCESS_TOKEN_COOKIE = "coworking_access_token";

export async function POST() {
  const response = NextResponse.json({
    status: true,
    message: "Logout berhasil.",
  });

  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  return response;
}
