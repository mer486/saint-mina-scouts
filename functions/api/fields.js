export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);

    const stage = url.searchParams.get("stage");

    if (!stage) {
      return Response.json(
        {
          success: false,
          error: "Stage is required",
        },
        {
          status: 400,
        }
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
          stages.slug AS stage_slug,
          stages.name AS stage_name
        FROM fields
        INNER JOIN stages
          ON stages.id = fields.stage_id
        WHERE stages.slug = ?
          AND stages.is_published = 1
          AND fields.is_published = 1
        ORDER BY fields.sort_order ASC
      `)
      .bind(stage)
      .all();

    return Response.json(results);
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: "Failed to load fields",
        details: error.message,
      },
      {
        status: 500,
      }
    );
  }
}