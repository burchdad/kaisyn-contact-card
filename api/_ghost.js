const allowedOrigins = new Set([
  "https://stephenburch.app",
  "https://i-need-to-make-a-quick.vercel.app",
  "http://localhost:4173",
  "http://localhost:3000"
]);

function setCors(req, res) {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1000000) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });

    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    req.on("data", (chunk) => {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      chunks.push(buffer);
      size += buffer.length;
      if (size > 1000000) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });

    req.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });

    req.on("error", reject);
  });
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "";
}

function enrichPayload(req, payload, recordType) {
  return {
    ...payload,
    recordType,
    source: payload.source || "qr_contact_card",
    sourceSystem: payload.sourceSystem || "contact_card",
    destinationSystem: payload.destinationSystem || "ghost_lead_command",
    capturedAt: new Date().toISOString(),
    request: {
      ip: getClientIp(req),
      userAgent: req.headers["user-agent"] || ""
    }
  };
}

async function forwardToGhostLeadCommand(payload) {
  const webhookUrl = process.env.GHOST_LEAD_COMMAND_WEBHOOK_URL;
  const webhookSecret = process.env.GHOST_LEAD_COMMAND_WEBHOOK_SECRET;

  if (!webhookUrl) {
    return { forwarded: false, reason: "missing_webhook_url" };
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(webhookSecret ? { Authorization: `Bearer ${webhookSecret}` } : {})
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Ghost Lead Command rejected payload: ${response.status} ${text}`);
  }

  return { forwarded: true };
}

module.exports = {
  enrichPayload,
  forwardToGhostLeadCommand,
  readJson,
  readRawBody,
  setCors
};
