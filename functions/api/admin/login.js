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

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();

    const password = body.password;

    if (!password) {
      return Response.json(
        {
          success: false,
          error: "Password is required",
        },
        { status: 400 }
      );
    }

    if (password !== context.env.ADMIN_PASSWORD) {
      return Response.json(
        {
          success: false,
          error: "Invalid password",
        },
        { status: 401 }
      );
    }

    const sessionToken = await createSignature(
      context.env.ADMIN_SESSION_SECRET
    );

    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        status: 200,

        headers: {
          "Content-Type": "application/json",

          "Set-Cookie": [
            `saint_mina_admin=${sessionToken}`,
            "HttpOnly",
            "Secure",
            "SameSite=Strict",
            "Path=/",
            "Max-Age=28800",
          ].join("; "),
        },
      }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: "Login failed",
      },
      { status: 500 }
    );
  }
}