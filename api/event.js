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

    if (!payload.eventName) {
      return res.status(400).json({ error: "eventName is required." });
    }

    const enrichedPayload = enrichPayload(req, payload, "event");
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
