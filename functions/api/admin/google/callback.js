export async function onRequestGet() {
  return new Response(
    "Google Drive is already configured.",
    {
      status: 200,
      headers: {
        "Content-Type": "text/plain;charset=UTF-8",
        "Cache-Control": "no-store",
      },
    }
  );
}