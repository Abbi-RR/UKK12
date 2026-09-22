"use server";

import { cookies } from "next/headers";
import {
  requestCoworkingApiRequest,
  type CoworkingApiResult,
} from "../../lib/coworking-api";

const ACCESS_TOKEN_COOKIE = "coworking_access_token";

export type AdminActionResult = CoworkingApiResult & { ok: boolean };

async function adminRequest(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE" = "GET",
  body?: unknown,
): Promise<AdminActionResult> {
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) {
    return { ok: false, status: 401, payload: { status: false, message: "Sesi admin tidak tersedia." } };
  }

  try {
    const result = await requestCoworkingApiRequest(endpoint, method, token, body);
    return { ...result, ok: result.status >= 200 && result.status < 300 && result.payload.status !== false };
  } catch {
    return { ok: false, status: 503, payload: { status: false, message: "Layanan API tidak dapat dijangkau." } };
  }
}

export async function getAdminReservations(month: number, year: number, status?: string) {
  const params = new URLSearchParams({ month: String(month), year: String(year) });
  if (status) params.set("status", status);
  return adminRequest(`/api/admin/reservasi?${params.toString()}`);
}

export async function getAdminProfile() {
  return adminRequest("/api/admin/profile");
}

export async function updateAdminProfile(body: {
  nama_coworking: string;
  nama_pemilik: string;
  telp: string;
}) {
  return adminRequest("/api/admin/profile", "PUT", body);
}

export async function getMonthlyReport(month: number, year: number) {
  return adminRequest(`/api/admin/reports/monthly?month=${month}&year=${year}`);
}

export async function getAdminSpaces() {
  return adminRequest("/api/admin/spaces");
}

export async function getIncomeReport(month: number, year: number) {
  return adminRequest(`/api/admin/reports/income?month=${month}&year=${year}`);
}

export async function updateReservationStatus(
  id: number,
  status: "menunggu" | "disetujui" | "dibatalkan",
) {
  return adminRequest(`/api/admin/reservasi/${id}/status`, "PATCH", { status });
}

export async function checkInReservation(id: number) {
  return adminRequest(`/api/admin/reservasi/${id}/check-in`, "POST");
}

export async function checkOutReservation(id: number) {
  return adminRequest(`/api/admin/reservasi/${id}/check-out`, "POST");
}

export async function getReservationTicket(id: number) {
  return adminRequest(`/api/reservasi/${id}/e-ticket`);
}

export async function getAdminMembers() { return adminRequest("/api/admin/members"); }
export async function getAdminMember(id: number) { return adminRequest(`/api/admin/members/${id}`); }
export async function createAdminMember(body: unknown) { return adminRequest("/api/admin/members", "POST", body); }
export async function updateAdminMember(id: number, body: unknown) { return adminRequest(`/api/admin/members/${id}`, "PUT", body); }
export async function deleteAdminMember(id: number) { return adminRequest(`/api/admin/members/${id}`, "DELETE"); }

export async function getAdminSpace(id?: number) { return adminRequest(id === undefined ? "/api/admin/spaces" : `/api/admin/spaces/${id}`); }
export async function createAdminSpace(body: unknown) { return adminRequest("/api/admin/spaces", "POST", body); }
export async function updateAdminSpace(id: number, body: unknown) { return adminRequest(`/api/admin/spaces/${id}`, "PUT", body); }
export async function deleteAdminSpace(id: number) { return adminRequest(`/api/admin/spaces/${id}`, "DELETE"); }

export async function getAdminDiscounts() { return adminRequest("/api/admin/diskon"); }
export async function getAdminDiscount(id: number) { return adminRequest(`/api/admin/diskon/${id}`); }
export async function createAdminDiscount(body: unknown) { return adminRequest("/api/admin/diskon", "POST", body); }
export async function updateAdminDiscount(id: number, body: unknown) { return adminRequest(`/api/admin/diskon/${id}`, "PUT", body); }
export async function deleteAdminDiscount(id: number) { return adminRequest(`/api/admin/diskon/${id}`, "DELETE"); }
