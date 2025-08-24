const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

export class ApiError<Data = unknown> extends Error {
  status: number;
  data: Data;
  constructor(message: string, status: number, data: Data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** Accept any object, or FormData/Blob/string */
type RequestBody = object | FormData | Blob | string | undefined;

export async function api<T>(
  path: string,
  opts: { method?: Method; body?: RequestBody; authToken?: string; credentials?: RequestCredentials } = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;

  const headers: HeadersInit = { Accept: "application/json" };

  let bodyToSend: BodyInit | undefined;
  if (opts.body !== undefined) {
    const isForm = typeof FormData !== "undefined" && opts.body instanceof FormData;
    if (!isForm && typeof opts.body === "object" && !(opts.body instanceof Blob)) {
      headers["Content-Type"] = "application/json";
      bodyToSend = JSON.stringify(opts.body);
    } else {
      bodyToSend = opts.body as BodyInit;
    }
  }

  const res = await fetch(url, {
    method: opts.method ?? "GET",
    headers,
    body: bodyToSend,
    cache: "no-store",
    credentials: opts.credentials,
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json().catch(() => ({})) : await res.text();

  if (!res.ok) {
    // safely extract a server message if present
    const message =
      (isJson &&
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof (data as { message: unknown }).message === "string"
        ? (data as { message: string }).message
        : null) || `HTTP ${res.status}`;

    throw new ApiError<typeof data>(message, res.status, data);
  }

  return data as T;
}
