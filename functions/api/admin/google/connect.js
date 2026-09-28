const COOKIE_NAME = "saint_mina_admin";

async function hmacHex(secret, value) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value)
  );

  return [...new Uint8Array(signature)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function isAdmin(request, env) {
  const cookie = request.headers.get("Cookie") || "";

  const match = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));

  if (!match) return false;

  const value = decodeURIComponent(match.substring(COOKIE_NAME.length + 1));

  const expected = await hmacHex(
    env.ADMIN_SESSION_SECRET,
    "saint-mina-scouts-admin"
  );

  return value === expected;
}

export async function onRequestGet(context) {
  const { request, env } = context;

  if (!(await isAdmin(request, env))) {
    return new Response("Unauthorized", { status: 401 });
  }

  const redirectUri =
    "https://saint-mina-scouts.pages.dev/api/admin/google/callback";

  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/drive.file",
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
  });

  return Response.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    302
  );
}