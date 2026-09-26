export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);

    const stageSlug =
      url.searchParams.get("stage");

    const fieldSlug =
      url.searchParams.get("field");

    if (!stageSlug || !fieldSlug) {
      return Response.json(
        {
          success: false,
          error: "Stage and field are required",
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

            fields.slug AS field_slug,
            fields.name AS field_name,

            stages.slug AS stage_slug,
            stages.name AS stage_name

          FROM lectures

          INNER JOIN fields
            ON fields.id = lectures.field_id

          INNER JOIN stages
            ON stages.id = fields.stage_id

          WHERE stages.slug = ?
            AND fields.slug = ?
            AND stages.is_published = 1
            AND fields.is_published = 1
            AND lectures.is_published = 1

          ORDER BY lectures.sort_order ASC
        `)
        .bind(
          stageSlug,
          fieldSlug
        )
        .all();

    return Response.json(results);
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: "Failed to load lectures",
        details:
          error?.message || String(error),
      },
      {
        status: 500,
      }
    );
  }
}