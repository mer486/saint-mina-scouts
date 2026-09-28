export async function onRequestGet(context) {
  const { request, env } = context;

  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    if (error) {
      return new Response(`Google authorization failed: ${error}`, {
        status: 400,
      });
    }

    if (!code) {
      return new Response("Missing authorization code.", {
        status: 400,
      });
    }

    const redirectUri =
      "https://saint-mina-scouts.pages.dev/api/admin/google/callback";

    const tokenResponse = await fetch(
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code,
          client_id: env.GOOGLE_CLIENT_ID,
          client_secret: env.GOOGLE_CLIENT_SECRET,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return new Response(
        `Token exchange failed: ${JSON.stringify(tokenData)}`,
        {
          status: 500,
          headers: { "Content-Type": "text/plain;charset=UTF-8" },
        }
      );
    }

    if (!tokenData.refresh_token) {
      return new Response(
        "Google connected, but no refresh token was returned. Reconnect using the consent screen.",
        {
          status: 400,
          headers: { "Content-Type": "text/plain;charset=UTF-8" },
        }
      );
    }

    return new Response(
      `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Google Drive Connected</title>
        </head>

        <body style="
          font-family: Arial, sans-serif;
          max-width: 700px;
          margin: 60px auto;
          padding: 24px;
          line-height: 1.6;
        ">
          <h1>Google Drive connected successfully</h1>

          <p>Your refresh token is:</p>

          <textarea
            readonly
            style="width:100%;height:140px;padding:12px;"
          >${tokenData.refresh_token}</textarea>

          <p>
            Copy this value and save it in Cloudflare as a Secret named:
          </p>

          <strong>GOOGLE_REFRESH_TOKEN</strong>

          <p>
            After saving it in Cloudflare, close this page.
            Do not share this token with anyone.
          </p>
        </body>
      </html>
      `,
      {
        headers: {
          "Content-Type": "text/html;charset=UTF-8",
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    return new Response(
      `Google OAuth error: ${error?.message || String(error)}`,
      {
        status: 500,
      }
    );
  }
}