export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/giveaway" && request.method === "POST") {
      try {
        const data = await request.json();

        const username = String(data.username || "").trim();
        const link = String(data.link || "").trim();
        const reason = String(data.reason || "").trim();

        if (!username || !link || !reason) {
          return Response.json(
            { success: false, error: "Semua data wajib diisi" },
            { status: 400 }
          );
        }

        const exists = await env.DB.prepare(
          "SELECT id FROM participants WHERE username = ?"
        ).bind(username).first();

        if (exists) {
          return Response.json(
            { success: false, error: "Username TikTok sudah terdaftar" },
            { status: 409 }
          );
        }

        await env.DB.prepare(
          "INSERT INTO participants (username, link, reason, created_at) VALUES (?, ?, ?, ?)"
        ).bind(
          username,
          link,
          reason,
          new Date().toISOString()
        ).run();

        return Response.json({ success: true });
      } catch (error) {
        return Response.json(
          { success: false, error: "Gagal menyimpan pendaftaran" },
          { status: 500 }
        );
      }
    }

    if (url.pathname === "/api/giveaway" && request.method === "GET") {
      try {
        const result = await env.DB.prepare(
          "SELECT id, username, link, reason, created_at FROM participants ORDER BY id DESC"
        ).all();

        return Response.json({
          success: true,
          participants: result.results
        });
      } catch (error) {
        return Response.json(
          { success: false, error: "Gagal mengambil data" },
          { status: 500 }
        );
      }
    }

    return env.ASSETS.fetch(request);
  }
};
