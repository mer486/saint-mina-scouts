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
  const header = request.headers.get("Cookie") || "";

  for (const cookie of header.split(";")) {
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

  if (!token) return false;

  const expected = await createSignature(
    context.env.ADMIN_SESSION_SECRET
  );

  return token === expected;
}

function unauthorized() {
  return Response.json(
    {
      success: false,
      error: "Unauthorized",
    },
    { status: 401 }
  );
}

/* ========================================
   GET ALL FIELDS FOR ADMIN
======================================== */

export async function onRequestGet(context) {
  if (!(await isAdmin(context))) {
    return unauthorized();
  }

  try {
    const url = new URL(context.request.url);
    const stageSlug = url.searchParams.get("stage");

    if (!stageSlug) {
      return Response.json(
        {
          success: false,
          error: "Stage is required",
        },
        { status: 400 }
      );
    }

    const { results } = await context.env.DB
      .prepare(`
        SELECT
          fields.id,
          fields.slug,
          fields.name,
          fields.description,
          fields.icon,
          fields.sort_order,
          fields.is_published,
          stages.slug AS stage_slug,
          stages.name AS stage_name
        FROM fields
        INNER JOIN stages
          ON stages.id = fields.stage_id
        WHERE stages.slug = ?
        ORDER BY fields.sort_order ASC
      `)
      .bind(stageSlug)
      .all();

    return Response.json(results);
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: "Failed to load fields",
      },
      { status: 500 }
    );
  }
}

/* ========================================
   CREATE FIELD
======================================== */

export async function onRequestPost(context) {
  if (!(await isAdmin(context))) {
    return unauthorized();
  }

  try {
    const body = await context.request.json();

    const stageSlug = body.stageSlug?.trim();
    const name = body.name?.trim();
    const description = body.description?.trim() || "";

    if (!stageSlug || !name) {
      return Response.json(
        {
          success: false,
          error: "Required data missing",
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

    const last = await context.env.DB
      .prepare(`
        SELECT MAX(sort_order) AS max_order
        FROM fields
        WHERE stage_id = ?
      `)
      .bind(stage.id)
      .first();

    const nextOrder =
      Number(last?.max_order || 0) + 1;

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
      },
      { status: 500 }
    );
  }
}

/* ========================================
   EDIT / PUBLISH FIELD
======================================== */

export async function onRequestPut(context) {
  if (!(await isAdmin(context))) {
    return unauthorized();
  }

  try {
    const body = await context.request.json();

    const id = Number(body.id);

    if (!id) {
      return Response.json(
        {
          success: false,
          error: "Field ID required",
        },
        { status: 400 }
      );
    }

    const existing = await context.env.DB
      .prepare(`
        SELECT *
        FROM fields
        WHERE id = ?
      `)
      .bind(id)
      .first();

    if (!existing) {
      return Response.json(
        {
          success: false,
          error: "Field not found",
        },
        { status: 404 }
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
          error: "Name is required",
        },
        { status: 400 }
      );
    }

    await context.env.DB
      .prepare(`
        UPDATE fields
        SET
          name = ?,
          description = ?,
          is_published = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(
        name,
        description,
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
        error: "Failed to update field",
      },
      { status: 500 }
    );
  }
}

/* ========================================
   DELETE FIELD
======================================== */

export async function onRequestDelete(context) {
  if (!(await isAdmin(context))) {
    return unauthorized();
  }

  try {
    const url = new URL(context.request.url);
    const id = Number(url.searchParams.get("id"));

    if (!id) {
      return Response.json(
        {
          success: false,
          error: "Field ID required",
        },
        { status: 400 }
      );
    }

    const field = await context.env.DB
      .prepare(`
        SELECT id, name
        FROM fields
        WHERE id = ?
      `)
      .bind(id)
      .first();

    if (!field) {
      return Response.json(
        {
          success: false,
          error: "Field not found",
        },
        { status: 404 }
      );
    }

    await context.env.DB
      .prepare(`
        DELETE FROM fields
        WHERE id = ?
      `)
      .bind(id)
      .run();

    return Response.json({
      success: true,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: "Failed to delete field",
      },
      { status: 500 }
    );
  }
}