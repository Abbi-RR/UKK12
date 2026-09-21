import { cookies } from "next/headers";
import {
  isRecord,
  requestCoworkingProfile,
  type CoworkingUserRole,
} from "./coworking-api";

const ACCESS_TOKEN_COOKIE = "coworking_access_token";

export type AuthenticatedUser = {
  role: CoworkingUserRole;
  displayName?: string;
  avatarUrl?: string;
};

function getOptionalString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

function getUserFromProfile(payload: unknown): AuthenticatedUser | null {
  if (!isRecord(payload) || !isRecord(payload.data)) {
    return null;
  }

  const role = payload.data.role;
  if (role !== "member" && role !== "admin_space") {
    return null;
  }

  return {
    role,
    displayName: getOptionalString(payload.data, ["nama_member", "name", "username"]),
    avatarUrl: getOptionalString(payload.data, ["foto_profil", "avatar_url", "avatar"]),
  };
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return null;
  }

  try {
    const profile = await requestCoworkingProfile(accessToken);
    if (profile.status < 200 || profile.status >= 300) {
      return null;
    }

    return getUserFromProfile(profile.payload);
  } catch {
    return null;
  }
}
