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
  const cookieHeader = request.headers.get("Cookie") || "";

  for (const cookie of cookieHeader.split(";")) {
    const [key, ...value] = cookie.trim().split("=");

    if (key === name) {
      return value.join("=");
    }
  }

  return null;
}

async function isAdmin(context) {
  const token = getCookie(
    context.request,
    "saint_mina_admin"
  );

  if (!token) {
    return false;
  }

  const expected = await createSignature(
    context.env.ADMIN_SESSION_SECRET
  );

  return token === expected;
}

export async function onRequestPost(context) {
  try {
    if (!(await isAdmin(context))) {
      return Response.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await context.request.json();

    const stageSlug = body.stageSlug?.trim();
    const name = body.name?.trim();
    const description = body.description?.trim() || "";

    if (!stageSlug || !name) {
      return Response.json(
        {
          success: false,
          error: "Stage and field name are required",
        },
        { status: 400 }
      );
    }

    const stage = await context.env.DB
      .prepare(`
        SELECT id
        FROM stages
        WHERE slug = ?
        LIMIT 1
      `)
      .bind(stageSlug)
      .first();

    if (!stage) {
      return Response.json(
        {
          success: false,
          error: "Stage not found",
        },
        { status: 404 }
      );
    }

    const lastField = await context.env.DB
      .prepare(`
        SELECT MAX(sort_order) AS max_order
        FROM fields
        WHERE stage_id = ?
      `)
      .bind(stage.id)
      .first();

    const nextOrder =
      Number(lastField?.max_order || 0) + 1;

    const slug =
      "field-" +
      Date.now().toString(36) +
      "-" +
      crypto.randomUUID().slice(0, 6);

    const result = await context.env.DB
      .prepare(`
        INSERT INTO fields (
          stage_id,
          slug,
          name,
          description,
          sort_order,
          is_published
        )
        VALUES (?, ?, ?, ?, ?, 1)
      `)
      .bind(
        stage.id,
        slug,
        name,
        description,
        nextOrder
      )
      .run();

    return Response.json(
      {
        success: true,
        id: result.meta.last_row_id,
        slug,
      },
      { status: 201 }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: "Failed to create field",
        details: error.message,
      },
      { status: 500 }
    );
  }
}