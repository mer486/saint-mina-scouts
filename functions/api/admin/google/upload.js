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

  const value = decodeURIComponent(
    match.substring(COOKIE_NAME.length + 1)
  );

  const expected = await hmacHex(
    env.ADMIN_SESSION_SECRET,
    "saint-mina-scouts-admin"
  );

  return value === expected;
}

async function getAccessToken(env) {
  const response = await fetch(
    "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        refresh_token: env.GOOGLE_REFRESH_TOKEN,
        grant_type: "refresh_token",
      }),
    }
  );

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    throw new Error(
      data.error_description ||
      data.error ||
      "Failed to obtain Google access token"
    );
  }

  return data.access_token;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    if (!(await isAdmin(request, env))) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return Response.json(
        { success: false, error: "PDF file is required" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return Response.json(
        { success: false, error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    const accessToken = await getAccessToken(env);

    const metadata = {
      name: file.name,
      mimeType: "application/pdf",
      parents: [env.GOOGLE_DRIVE_FOLDER_ID],
    };

    const boundary =
      "saint_mina_boundary_" + crypto.randomUUID();

    const encoder = new TextEncoder();

    const metadataPart = encoder.encode(
      `--${boundary}\r\n` +
      `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
      `${JSON.stringify(metadata)}\r\n` +
      `--${boundary}\r\n` +
      `Content-Type: application/pdf\r\n\r\n`
    );

    const fileBytes = new Uint8Array(
      await file.arrayBuffer()
    );

    const closingPart = encoder.encode(
      `\r\n--${boundary}--`
    );

    const body = new Uint8Array(
      metadataPart.length +
      fileBytes.length +
      closingPart.length
    );

    body.set(metadataPart, 0);
    body.set(fileBytes, metadataPart.length);
    body.set(
      closingPart,
      metadataPart.length + fileBytes.length
    );

    const uploadResponse = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type":
            `multipart/related; boundary=${boundary}`,
        },
        body,
      }
    );

    const uploadData = await uploadResponse.json();

    if (!uploadResponse.ok) {
      throw new Error(
        uploadData?.error?.message ||
        "Google Drive upload failed"
      );
    }

    return Response.json({
      success: true,
      fileId: uploadData.id,
      fileName: uploadData.name,
      pdfKey: `gdrive:${uploadData.id}`,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: "PDF upload failed",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}