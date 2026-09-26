export async function onRequestGet(context) {
  try {
    const { results } = await context.env.DB
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
          sort_order
        FROM stages
        WHERE is_published = 1
        ORDER BY sort_order ASC
      `)
      .all();

    return Response.json(results);
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: "Failed to load stages",
        details: error.message,
      },
      {
        status: 500,
      }
    );
  }
}