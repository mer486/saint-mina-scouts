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
    encoder.encode(
      "saint-mina-scouts-admin"
    )
  );

  return Array.from(
    new Uint8Array(signature)
  )
    .map((byte) =>
      byte
        .toString(16)
        .padStart(2, "0")
    )
    .join("");
}

function getCookie(request, name) {
  const cookieHeader =
    request.headers.get("Cookie") || "";

  const cookies =
    cookieHeader.split(";");

  for (const cookie of cookies) {
    const [cookieName, ...valueParts] =
      cookie.trim().split("=");

    if (cookieName === name) {
      return valueParts.join("=");
    }
  }

  return null;
}

async function isAdmin(context) {
  if (
    !context.env.ADMIN_SESSION_SECRET
  ) {
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

  return (
    currentToken === expectedToken
  );
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
// GET LECTURES
// ==========================================

export async function onRequestGet(context) {
  try {
    if (!(await isAdmin(context))) {
      return unauthorized();
    }

    const url = new URL(
      context.request.url
    );

    const fieldId = Number(
      url.searchParams.get("field")
    );

    if (!fieldId) {
      return Response.json(
        {
          success: false,
          error: "Field ID is required",
        },
        {
          status: 400,
        }
      );
    }

    const { results } =
      await context.env.DB
        .prepare(`
          SELECT
            lectures.id,
            lectures.slug,
            lectures.title,
            lectures.description,
            lectures.pdf_key,
            lectures.pdf_original_name,
            lectures.updated_date,
            lectures.sort_order,
            lectures.is_published,

            fields.id AS field_id,
            fields.name AS field_name

          FROM lectures

          INNER JOIN fields
            ON fields.id = lectures.field_id

          WHERE lectures.field_id = ?

          ORDER BY lectures.sort_order ASC
        `)
        .bind(fieldId)
        .all();

    return Response.json(results);
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: "Failed to load admin lectures",
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
// CREATE LECTURE
// ==========================================

export async function onRequestPost(context) {
  try {
    if (!(await isAdmin(context))) {
      return unauthorized();
    }

    const body =
      await context.request.json();

    const fieldId =
      Number(body.fieldId);

    const title =
      body.title?.trim();

    const description =
      body.description?.trim() || "";

    const pdfKey =
      body.pdfKey?.trim() || "";

    const pdfOriginalName =
      body.pdfOriginalName?.trim() || "";

    const updatedDate =
      body.updatedDate?.trim() || "";

    if (!fieldId || !title) {
      return Response.json(
        {
          success: false,
          error:
            "Field ID and title are required",
        },
        {
          status: 400,
        }
      );
    }

    const field =
      await context.env.DB
        .prepare(`
          SELECT id
          FROM fields
          WHERE id = ?
          LIMIT 1
        `)
        .bind(fieldId)
        .first();

    if (!field) {
      return Response.json(
        {
          success: false,
          error: "Field not found",
        },
        {
          status: 404,
        }
      );
    }

    const orderResult =
      await context.env.DB
        .prepare(`
          SELECT
            MAX(sort_order) AS max_order
          FROM lectures
          WHERE field_id = ?
        `)
        .bind(fieldId)
        .first();

    const nextOrder =
      Number(
        orderResult?.max_order || 0
      ) + 1;

    const slug =
      "lecture-" +
      Date.now().toString(36) +
      "-" +
      crypto.randomUUID().slice(0, 6);

    const result =
      await context.env.DB
        .prepare(`
          INSERT INTO lectures (
            field_id,
            slug,
            title,
            description,
            pdf_key,
            pdf_original_name,
            updated_date,
            sort_order,
            is_published
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
        `)
        .bind(
          fieldId,
          slug,
          title,
          description,
          pdfKey,
          pdfOriginalName,
          updatedDate,
          nextOrder
        )
        .run();

    return Response.json(
      {
        success: true,
        id:
          result.meta.last_row_id,
        slug,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: "Failed to create lecture",
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
// UPDATE LECTURE
// ==========================================

export async function onRequestPut(context) {
  try {
    if (!(await isAdmin(context))) {
      return unauthorized();
    }

    const body =
      await context.request.json();

    const id =
      Number(body.id);

    if (!id) {
      return Response.json(
        {
          success: false,
          error: "Lecture ID is required",
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
          FROM lectures
          WHERE id = ?
          LIMIT 1
        `)
        .bind(id)
        .first();

    if (!existing) {
      return Response.json(
        {
          success: false,
          error: "Lecture not found",
        },
        {
          status: 404,
        }
      );
    }

    const title =
      body.title !== undefined
        ? body.title.trim()
        : existing.title;

    const description =
      body.description !== undefined
        ? body.description.trim()
        : existing.description;

    const pdfKey =
      body.pdfKey !== undefined
        ? body.pdfKey.trim()
        : existing.pdf_key;

    const pdfOriginalName =
      body.pdfOriginalName !== undefined
        ? body.pdfOriginalName.trim()
        : existing.pdf_original_name;

    const updatedDate =
      body.updatedDate !== undefined
        ? body.updatedDate.trim()
        : existing.updated_date;

    const isPublished =
      body.isPublished !== undefined
        ? body.isPublished
          ? 1
          : 0
        : existing.is_published;

    if (!title) {
      return Response.json(
        {
          success: false,
          error:
            "Lecture title is required",
        },
        {
          status: 400,
        }
      );
    }

    await context.env.DB
      .prepare(`
        UPDATE lectures

        SET
          title = ?,
          description = ?,
          pdf_key = ?,
          pdf_original_name = ?,
          updated_date = ?,
          is_published = ?,
          updated_at = CURRENT_TIMESTAMP

        WHERE id = ?
      `)
      .bind(
        title,
        description,
        pdfKey,
        pdfOriginalName,
        updatedDate,
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
        error: "Failed to update lecture",
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
// DELETE LECTURE
// ==========================================

export async function onRequestDelete(context) {
  try {
    if (!(await isAdmin(context))) {
      return unauthorized();
    }

    const url = new URL(
      context.request.url
    );

    const id = Number(
      url.searchParams.get("id")
    );

    if (!id) {
      return Response.json(
        {
          success: false,
          error:
            "Lecture ID is required",
        },
        {
          status: 400,
        }
      );
    }

    const existing =
      await context.env.DB
        .prepare(`
          SELECT
            id,
            title
          FROM lectures
          WHERE id = ?
          LIMIT 1
        `)
        .bind(id)
        .first();

    if (!existing) {
      return Response.json(
        {
          success: false,
          error: "Lecture not found",
        },
        {
          status: 404,
        }
      );
    }

    await context.env.DB
      .prepare(`
        DELETE FROM lectures
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
        error: "Failed to delete lecture",
        details:
          error?.message || String(error),
      },
      {
        status: 500,
      }
    );
  }
}