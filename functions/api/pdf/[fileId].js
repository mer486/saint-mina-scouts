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

export async function onRequestGet(context) {
  const { env, params, request } = context;

  try {
    const fileId = params.fileId;

    if (!fileId) {
      return new Response("PDF not found", {
        status: 404,
      });
    }

    const accessToken = await getAccessToken(env);

    // First get the original filename.
    const metadataResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
        fileId
      )}?fields=id,name,mimeType`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!metadataResponse.ok) {
      return new Response("PDF not found", {
        status: 404,
      });
    }

    const metadata = await metadataResponse.json();

    if (metadata.mimeType !== "application/pdf") {
      return new Response("File is not a PDF", {
        status: 400,
      });
    }

    const driveResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
        fileId
      )}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!driveResponse.ok) {
      return new Response("Unable to load PDF", {
        status: driveResponse.status,
      });
    }

    const requestUrl = new URL(request.url);

    const shouldDownload =
      requestUrl.searchParams.get("download") === "1";

    const safeName = (metadata.name || "document.pdf")
      .replace(/["\r\n]/g, "_");

    return new Response(driveResponse.body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",

        "Content-Disposition": shouldDownload
          ? `attachment; filename="${safeName}"`
          : `inline; filename="${safeName}"`,

        "Cache-Control":
          "public, max-age=300",

        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: "Unable to load PDF",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}