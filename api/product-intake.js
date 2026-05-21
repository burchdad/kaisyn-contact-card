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
    const buyer = payload.buyer || {};

    if (!buyer.name || !buyer.email || !buyer.businessName || !buyer.goal || buyer.consent !== true) {
      return res.status(400).json({
        error: "Name, email, business name, goal, and follow-up consent are required."
      });
    }

    const enrichedPayload = enrichPayload(req, payload, "product_intake");
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
