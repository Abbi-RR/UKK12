"use server";

import { cookies } from "next/headers";
import {
  requestCoworkingApiRequest,
  type CoworkingApiResult,
} from "../../../lib/coworking-api";

const ACCESS_TOKEN_COOKIE = "coworking_access_token";

export type BookingActionResult = CoworkingApiResult & { ok: boolean };

async function getMemberToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
}

function unauthorizedResult(): BookingActionResult {
  return {
    ok: false,
    status: 401,
    payload: { status: false, message: "Sesi Member tidak tersedia." },
  };
}

async function publicRequest(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" = "GET",
  body?: unknown,
): Promise<BookingActionResult> {
  try {
    const result = await requestCoworkingApiRequest(endpoint, method, undefined, body);
    return { ...result, ok: result.status >= 200 && result.status < 300 && result.payload.status !== false };
  } catch {
    return { ok: false, status: 503, payload: { status: false, message: "Layanan API tidak dapat dijangkau." } };
  }
}

async function memberRequest(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" = "GET",
  body?: unknown,
): Promise<BookingActionResult> {
  const token = await getMemberToken();
  if (!token) return unauthorizedResult();

  try {
    const result = await requestCoworkingApiRequest(endpoint, method, token, body);
    return { ...result, ok: result.status >= 200 && result.status < 300 && result.payload.status !== false };
  } catch {
    return { ok: false, status: 503, payload: { status: false, message: "Layanan API tidak dapat dijangkau." } };
  }
}

export async function getSpaceTypes() {
  return publicRequest("/api/spaces/types");
}

export async function getSpaces(tipe?: string, search?: string) {
  const params = new URLSearchParams();
  if (tipe) params.set("tipe", tipe);
  if (search?.trim()) params.set("search", search.trim());
  const query = params.toString();
  const endpoint = `/api/spaces${query ? `?${query}` : ""}`;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

  if (process.env.NODE_ENV === "development") {
    console.debug("[Spaces] API URL:", `${apiUrl ?? ""}${endpoint}`);
    console.debug(
      "[Spaces] App key configured:",
      Boolean(process.env.COWORKING_APP_KEY),
    );
  }

  const result = await publicRequest(endpoint);

  if (process.env.NODE_ENV === "development") {
    const dataCount = Array.isArray(result.payload.data)
      ? result.payload.data.length
      : 0;
    console.debug("[Spaces] HTTP status:", result.status);
    console.debug("[Spaces] Response data count:", dataCount);
  }

  return result;
}

export async function getSpace(id: number) {
  return publicRequest(`/api/spaces/${id}`);
}

export async function getAvailability(input: {
  idSpace: number;
  tanggal: string;
  jamMulai: string;
  durasiJam: number;
}) {
  const params = new URLSearchParams({
    id_space: String(input.idSpace),
    tanggal: input.tanggal,
    jam_mulai: input.jamMulai,
    durasi_jam: String(input.durasiJam),
  });
  return publicRequest(`/api/spaces/availability?${params.toString()}`);
}

export async function getActiveDiscounts() {
  return publicRequest("/api/diskon/active");
}

export async function checkDiscount(namaDiskon: string) {
  return publicRequest("/api/diskon/check", "POST", { nama_diskon: namaDiskon });
}

export async function getMyReservations() {
  return memberRequest("/api/reservasi/my");
}

export async function getMyReservationHistory(month?: number, year?: number) {
  const params = new URLSearchParams();
  if (month) params.set("month", String(month));
  if (year) params.set("year", String(year));
  const query = params.toString();
  return memberRequest(`/api/reservasi/my/history${query ? `?${query}` : ""}`);
}

export async function getReservation(id: number) {
  return memberRequest(`/api/reservasi/${id}`);
}

export async function getReservationTicket(id: number) {
  return memberRequest(`/api/reservasi/${id}/e-ticket`);
}

export async function createReservation(input: {
  idSpace: number;
  tanggalReservasi: string;
  jamMulai: string;
  durasiJam: number;
  idDiskon?: number;
  kodePromo?: string;
}) {
  const body: Record<string, number | string> = {
    id_space: input.idSpace,
    tanggal_reservasi: input.tanggalReservasi,
    jam_mulai: input.jamMulai,
    durasi_jam: input.durasiJam,
  };
  if (input.idDiskon !== undefined) body.id_diskon = input.idDiskon;
  if (input.kodePromo) body.kode_promo = input.kodePromo;
  return memberRequest("/api/reservasi", "POST", body);
}

export async function cancelReservation(id: number) {
  return memberRequest(`/api/reservasi/${id}/cancel`, "PATCH");
}
