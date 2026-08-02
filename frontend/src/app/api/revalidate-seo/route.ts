import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

type RevalidationPayload = {
  paths?: unknown;
  invalidateLayout?: unknown;
};

function hasValidSecret(request: Request) {
  const expected = process.env.SEO_REVALIDATION_SECRET;
  const received = request.headers.get("x-seo-revalidation-secret");
  if (!expected || !received) return false;

  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
}

function validPath(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//");
}

export async function POST(request: Request) {
  if (!hasValidSecret(request)) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Invalid revalidation secret" } }, { status: 401 });
  }

  let payload: RevalidationPayload;
  try {
    payload = (await request.json()) as RevalidationPayload;
  } catch {
    return NextResponse.json({ error: { code: "INVALID_PAYLOAD", message: "A JSON payload is required" } }, { status: 400 });
  }

  if (payload.paths !== undefined && (!Array.isArray(payload.paths) || payload.paths.some((path) => !validPath(path)))) {
    return NextResponse.json({ error: { code: "INVALID_PAYLOAD", message: "paths must contain valid URL paths" } }, { status: 400 });
  }

  const paths = [...new Set((payload.paths as string[] | undefined) ?? [])];
  if (payload.invalidateLayout === true) revalidatePath("/", "layout");
  paths.forEach((path) => revalidatePath(path, "page"));

  return NextResponse.json({ data: { revalidated: true, paths, invalidateLayout: payload.invalidateLayout === true } });
}
