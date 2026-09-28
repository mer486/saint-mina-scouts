export async function onRequestGet(context) {
  try {
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
            sort_order

          FROM stages

          WHERE is_published = 1

          ORDER BY sort_order ASC
        `)
        .all();

    const normalizedResults = results.map(
      (stage) => ({
        ...stage,

        leader_guide_pdf_key:
          stage.leader_guide_pdf_key?.startsWith(
            "gdrive:"
          )
            ? `/api/pdf/${encodeURIComponent(
                stage.leader_guide_pdf_key.slice(7)
              )}`
            : stage.leader_guide_pdf_key,
      })
    );

    return Response.json(normalizedResults);
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: "Failed to load stages",
        details:
          error?.message || String(error),
      },
      {
        status: 500,
      }
    );
  }
}