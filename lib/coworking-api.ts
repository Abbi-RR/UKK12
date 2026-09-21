export type CoworkingApiPayload = {
  status?: unknown;
  statusCode?: unknown;
  message?: unknown;
  error?: unknown;
  data?: unknown;
  [key: string]: unknown;
};

export type CoworkingUserRole = "member" | "admin_space";

export type CoworkingApiResult = {
  status: number;
  payload: CoworkingApiPayload;
};

export type CoworkingApiFailureCode = "CONFIG" | "TIMEOUT" | "NETWORK";

export class CoworkingApiError extends Error {
  readonly code: CoworkingApiFailureCode;

  constructor(code: CoworkingApiFailureCode, message: string) {
    super(message);
    this.name = "CoworkingApiError";
    this.code = code;
  }
}

const API_REQUEST_TIMEOUT_MS = 15000;

function createApiController() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_REQUEST_TIMEOUT_MS);

  return { controller, timeout };
}

function getNetworkError(controller: AbortController, error: unknown) {
  return new CoworkingApiError(
    controller.signal.aborted ? "TIMEOUT" : "NETWORK",
    error instanceof Error ? error.message : "API request failed.",
  );
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function requestCoworkingApi(
  endpoint: string,
  body: unknown,
): Promise<{ status: number; payload: CoworkingApiPayload }> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const appKey = process.env.COWORKING_APP_KEY;

  if (!apiUrl || !appKey) {
    throw new CoworkingApiError("CONFIG", "API configuration is incomplete.");
  }

  const { controller, timeout } = createApiController();
  let response: Response;

  try {
    response = await fetch(`${apiUrl.replace(/\/$/, "")}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-maker-key": appKey,
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timeout);
    throw getNetworkError(controller, error);
  }

  clearTimeout(timeout);

  const responseText = await response.text();
  let parsedResponse: unknown;

  try {
    parsedResponse = responseText ? JSON.parse(responseText) : {};
  } catch {
    parsedResponse = {};
  }

  return {
    status: response.status,
    payload: isRecord(parsedResponse) ? parsedResponse : {},
  };
}

export async function requestCoworkingProfile(
  accessToken: string,
): Promise<{ status: number; payload: CoworkingApiPayload }> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const appKey = process.env.COWORKING_APP_KEY;

  if (!apiUrl || !appKey) {
    throw new CoworkingApiError("CONFIG", "API configuration is incomplete.");
  }

  const { controller, timeout } = createApiController();
  let response: Response;

  try {
    response = await fetch(`${apiUrl.replace(/\/$/, "")}/api/auth/profile`, {
      method: "GET",
      headers: {
        "x-maker-key": appKey,
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timeout);
    throw getNetworkError(controller, error);
  }

  clearTimeout(timeout);

  const responseText = await response.text();
  let parsedResponse: unknown;

  try {
    parsedResponse = responseText ? JSON.parse(responseText) : {};
  } catch {
    parsedResponse = {};
  }

  return {
    status: response.status,
    payload: isRecord(parsedResponse) ? parsedResponse : {},
  };
}

export async function requestCoworkingApiRequest(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
  accessToken?: string,
  body?: unknown,
): Promise<CoworkingApiResult> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const appKey = process.env.COWORKING_APP_KEY;

  if (!apiUrl || !appKey) {
    throw new CoworkingApiError("CONFIG", "API configuration is incomplete.");
  }

  const headers: Record<string, string> = {
    "x-maker-key": appKey,
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const { controller, timeout } = createApiController();
  let response: Response;

  try {
    response = await fetch(`${apiUrl.replace(/\/$/, "")}${endpoint}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timeout);
    throw getNetworkError(controller, error);
  }

  clearTimeout(timeout);

  const responseText = await response.text();
  let parsedResponse: unknown;

  try {
    parsedResponse = responseText ? JSON.parse(responseText) : {};
  } catch {
    parsedResponse = {};
  }

  return {
    status: response.status,
    payload: isRecord(parsedResponse) ? parsedResponse : {},
  };
}

export function getApiMessage(payload: CoworkingApiPayload, fallback: string): string {
  if (typeof payload.message === "string" && payload.message.trim()) {
    return payload.message;
  }

  return fallback;
}
