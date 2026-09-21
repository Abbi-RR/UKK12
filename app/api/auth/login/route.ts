import { NextResponse } from "next/server";
import {
  CoworkingApiError,
  getApiMessage,
  isRecord,
  requestCoworkingApi,
} from "../../../../lib/coworking-api";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const result = await requestCoworkingApi("/api/auth/login", body);

    if (result.status !== 200 || result.payload.status !== true) {
      return NextResponse.json(
        {
          status: false,
          statusCode: result.status,
          message: getApiMessage(result.payload, "Login gagal. Silakan coba lagi."),
        },
        { status: result.status >= 400 ? result.status : 502 },
      );
    }

    const data = isRecord(result.payload.data) ? result.payload.data : {};
    const role = data.role;
    const accessToken = data.access_token;

    if (role !== "member" && role !== "admin_space") {
      return NextResponse.json(
        {
          status: false,
          statusCode: 403,
          message: "Role akun tidak didukung oleh RuangKerja.",
        },
        { status: 403 },
      );
    }

    if (typeof accessToken !== "string" || !accessToken) {
      return NextResponse.json(
        {
          status: false,
          statusCode: 502,
          message: "Login berhasil tetapi sesi tidak dapat dibuat.",
        },
        { status: 502 },
      );
    }

    const response = NextResponse.json(
      {
        status: true,
        statusCode: result.status,
        message: getApiMessage(result.payload, "Login berhasil."),
        data: { role },
      },
      { status: 200 },
    );

    response.cookies.set("coworking_access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error) {
    const message = error instanceof CoworkingApiError && error.code === "CONFIG"
      ? "Konfigurasi layanan login belum tersedia."
      : error instanceof CoworkingApiError && error.code === "TIMEOUT"
        ? "Layanan login tidak merespons dalam batas waktu."
        : "Layanan login tidak dapat dijangkau. Silakan coba lagi.";

    return NextResponse.json(
      {
        status: false,
        statusCode: 502,
        message,
      },
      { status: 502 },
    );
  }
}
