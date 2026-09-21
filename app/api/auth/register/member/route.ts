import { NextResponse } from "next/server";
import {
  getApiMessage,
  requestCoworkingApi,
} from "../../../../../lib/coworking-api";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const result = await requestCoworkingApi("/api/auth/register/member", body);

    if (result.status === 201 && result.payload.status === true) {
      return NextResponse.json(
        {
          status: true,
          statusCode: result.status,
          message: getApiMessage(result.payload, "Registrasi member berhasil!"),
        },
        { status: result.status },
      );
    }

    return NextResponse.json(
      {
        status: false,
        statusCode: result.status,
        message: getApiMessage(result.payload, "Registrasi member gagal. Silakan coba lagi."),
      },
      { status: result.status >= 400 ? result.status : 502 },
    );
  } catch {
    return NextResponse.json(
      {
        status: false,
        statusCode: 502,
        message: "Layanan registrasi tidak dapat dijangkau. Silakan coba lagi.",
      },
      { status: 502 },
    );
  }
}
