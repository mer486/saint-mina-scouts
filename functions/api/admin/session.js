async function createSignature(secret) {
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode("saint-mina-scouts-admin")
  );

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function getCookie(request, name) {
  const cookieHeader =
    request.headers.get("Cookie") || "";

  const cookies = cookieHeader.split(";");

  for (const cookie of cookies) {
    const [key, ...value] = cookie.trim().split("=");

    if (key === name) {
      return value.join("=");
    }
  }

  return null;
}

export async function onRequestGet(context) {
  const currentToken = getCookie(
    context.request,
    "saint_mina_admin"
  );

  if (!currentToken) {
    return Response.json({
      authenticated: false,
    });
  }

  const expectedToken = await createSignature(
    context.env.ADMIN_SESSION_SECRET
  );

  return Response.json({
    authenticated: currentToken === expectedToken,
  });
}