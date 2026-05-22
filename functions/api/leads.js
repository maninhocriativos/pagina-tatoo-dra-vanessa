const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });

const clean = (value, maxLength = 180) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, maxLength);

export async function onRequestOptions() {
  return json({ ok: true });
}

export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const lead = {
      name: clean(data.name, 140),
      phone: clean(data.phone, 40),
      procedure: clean(data.procedure, 80),
      source: clean(data.source, 120),
      page: clean(data.page, 300),
      userAgent: clean(context.request.headers.get("user-agent"), 300),
      createdAt: new Date().toISOString()
    };

    if (!lead.name || !lead.phone || !lead.procedure) {
      return json({ ok: false, error: "missing_required_fields" }, 400);
    }

    if (!context.env.LEADS_DB) {
      return json({ ok: false, error: "missing_d1_binding" }, 503);
    }

    await context.env.LEADS_DB.prepare(
      `INSERT INTO leads (name, phone, procedure, source, page, user_agent, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        lead.name,
        lead.phone,
        lead.procedure,
        lead.source,
        lead.page,
        lead.userAgent,
        lead.createdAt
      )
      .run();

    return json({ ok: true });
  } catch (error) {
    return json({ ok: false, error: "invalid_request" }, 400);
  }
}
