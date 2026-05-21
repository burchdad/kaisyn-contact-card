const {
  enrichPayload,
  forwardToGhostLeadCommand,
  readJson,
  setCors
} = require("./_ghost");

module.exports = async function handler(req, res) {
  setCors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const payload = await readJson(req);
    const lead = payload.lead || {};

    if (!lead.name || !lead.email || !lead.goal || lead.consent !== true) {
      return res.status(400).json({
        error: "Name, email, goal, and follow-up consent are required."
      });
    }

    const enrichedPayload = enrichPayload(req, payload, "lead");
    const forwardResult = await forwardToGhostLeadCommand(enrichedPayload);

    return res.status(202).json({
      ok: true,
      forwarded: forwardResult.forwarded,
      reason: forwardResult.reason || null
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
