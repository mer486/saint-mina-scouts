// ==========================================
// ADMIN AUTHENTICATION
// ==========================================

async function createAdminToken(secret) {
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode("saint-mina-scouts-admin")
  );

  return Array.from(new Uint8Array(signature))
    .map((byte) =>
      byte.toString(16).padStart(2, "0")
    )
    .join("");
}

function getCookie(request, name) {
  const cookieHeader =
    request.headers.get("Cookie") || "";

  for (const cookie of cookieHeader.split(";")) {
    const [cookieName, ...valueParts] =
      cookie.trim().split("=");

    if (cookieName === name) {
      return valueParts.join("=");
    }
  }

  return null;
}

async function isAdmin(context) {
  if (!context.env.ADMIN_SESSION_SECRET) {
    throw new Error(
      "ADMIN_SESSION_SECRET is missing"
    );
  }

  const currentToken = getCookie(
    context.request,
    "saint_mina_admin"
  );

  if (!currentToken) {
    return false;
  }

  const expectedToken =
    await createAdminToken(
      context.env.ADMIN_SESSION_SECRET
    );

  return currentToken === expectedToken;
}

function unauthorized() {
  return Response.json(
    {
      success: false,
      error: "Unauthorized",
    },
    {
      status: 401,
    }
  );
}

// ==========================================
// GET ALL STAGES FOR ADMIN
// ==========================================

export async function onRequestGet(context) {
  try {
    if (!(await isAdmin(context))) {
      return unauthorized();
    }

    const { results } =
      await context.env.DB
        .prepare(`
          SELECT
            id,
            slug,
            name,
            description,
            intro,
            image_url,
            leader_guide_title,
            leader_guide_pdf_key,
            leader_guide_updated_at,
            sort_order,
            is_published

          FROM stages

          ORDER BY sort_order ASC
        `)
        .all();

    return Response.json(results);
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: "Failed to load admin stages",
        details:
          error?.message || String(error),
      },
      {
        status: 500,
      }
    );
  }
}

// ==========================================
// UPDATE STAGE
// ==========================================

export async function onRequestPut(context) {
  try {
    if (!(await isAdmin(context))) {
      return unauthorized();
    }

    const body =
      await context.request.json();

    const id = Number(body.id);

    if (!id) {
      return Response.json(
        {
          success: false,
          error: "Stage ID is required",
        },
        {
          status: 400,
        }
      );
    }

    const existing =
      await context.env.DB
        .prepare(`
          SELECT *
          FROM stages
          WHERE id = ?
          LIMIT 1
        `)
        .bind(id)
        .first();

    if (!existing) {
      return Response.json(
        {
          success: false,
          error: "Stage not found",
        },
        {
          status: 404,
        }
      );
    }

    const name =
      body.name !== undefined
        ? body.name.trim()
        : existing.name;

    const description =
      body.description !== undefined
        ? body.description.trim()
        : existing.description;

    const intro =
      body.intro !== undefined
        ? body.intro.trim()
        : existing.intro;

    const imageUrl =
      body.imageUrl !== undefined
        ? body.imageUrl.trim()
        : existing.image_url;

    const leaderGuideTitle =
      body.leaderGuideTitle !== undefined
        ? body.leaderGuideTitle.trim()
        : existing.leader_guide_title;

    const leaderGuidePdfKey =
      body.leaderGuidePdfKey !== undefined
        ? body.leaderGuidePdfKey.trim()
        : existing.leader_guide_pdf_key;

    const leaderGuideUpdatedAt =
      body.leaderGuideUpdatedAt !== undefined
        ? body.leaderGuideUpdatedAt.trim()
        : existing.leader_guide_updated_at;

    const isPublished =
      body.isPublished !== undefined
        ? body.isPublished
          ? 1
          : 0
        : existing.is_published;

    if (!name) {
      return Response.json(
        {
          success: false,
          error: "Stage name is required",
        },
        {
          status: 400,
        }
      );
    }

    await context.env.DB
      .prepare(`
        UPDATE stages

        SET
          name = ?,
          description = ?,
          intro = ?,
          image_url = ?,
          leader_guide_title = ?,
          leader_guide_pdf_key = ?,
          leader_guide_updated_at = ?,
          is_published = ?,
          updated_at = CURRENT_TIMESTAMP

        WHERE id = ?
      `)
      .bind(
        name,
        description,
        intro,
        imageUrl,
        leaderGuideTitle,
        leaderGuidePdfKey,
        leaderGuideUpdatedAt,
        isPublished,
        id
      )
      .run();

    return Response.json({
      success: true,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: "Failed to update stage",
        details:
          error?.message || String(error),
      },
      {
        status: 500,
      }
    );
  }
}