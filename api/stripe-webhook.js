const crypto = require("crypto");
const {
  enrichPayload,
  forwardToGhostLeadCommand,
  readRawBody,
  setCors
} = require("./_ghost");

const commissionRate = 0.2;
const stripeToleranceSeconds = 300;

function parseStripeSignature(header) {
  return String(header || "")
    .split(",")
    .reduce((parts, item) => {
      const [key, value] = item.split("=");
      if (!key || !value) return parts;
      if (!parts[key]) parts[key] = [];
      parts[key].push(value);
      return parts;
    }, {});
}

function safeEqual(a, b) {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function verifyStripeSignature(rawBody, signatureHeader, secret) {
  const parts = parseStripeSignature(signatureHeader);
  const timestamp = Number(parts.t?.[0]);
  const signatures = parts.v1 || [];

  if (!timestamp || !signatures.length) {
    throw new Error("Missing Stripe signature timestamp or v1 signature.");
  }

  const age = Math.abs(Date.now() / 1000 - timestamp);
  if (age > stripeToleranceSeconds) {
    throw new Error("Stripe signature timestamp is outside tolerance.");
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`, "utf8")
    .digest("hex");

  if (!signatures.some((signature) => safeEqual(expected, signature))) {
    throw new Error("Stripe signature verification failed.");
  }
}

function parseClientReference(clientReferenceId) {
  const parts = String(clientReferenceId || "").split("__");
  if (parts[0] !== "cc") {
    return {
      productFamily: "unknown",
      selectedPlan: "",
      referralCode: "",
      referredByCardOwnerId: "",
      visitorId: ""
    };
  }

  return {
    productFamily: "contact_card",
    selectedPlan: parts[1] || "",
    referralCode: parts[2] === "direct" ? "" : parts[2] || "",
    referredByCardOwnerId: parts[3] === "noowner" ? "" : parts[3] || "",
    visitorId: parts[4] || ""
  };
}

function moneyFromMinorUnits(amount, currency) {
  if (typeof amount !== "number") return null;
  return {
    amountMinor: amount,
    amount: amount / 100,
    currency: String(currency || "usd").toUpperCase()
  };
}

function calculateCommission(amountTotal, currency, eligible) {
  const sale = moneyFromMinorUnits(amountTotal, currency);
  const commissionAmountMinor = eligible && sale ? Math.round(amountTotal * commissionRate) : 0;

  return {
    program: "contact_card_associate",
    eligible,
    rate: eligible ? commissionRate : 0,
    payoutModel: "first_payment_manual_review",
    status: eligible && commissionAmountMinor > 0 ? "approved_for_review" : "pending_payment_confirmation",
    sale,
    commission: moneyFromMinorUnits(commissionAmountMinor, currency),
    trigger: "stripe_webhook"
  };
}

function buildCheckoutCompletedPayload(req, event) {
  const session = event.data.object;
  const reference = parseClientReference(session.client_reference_id);
  const paymentStatus = session.payment_status || "";
  const amountTotal = typeof session.amount_total === "number" ? session.amount_total : 0;
  const isPaid = paymentStatus === "paid" && amountTotal > 0;
  const isReferred = Boolean(reference.referralCode || reference.referredByCardOwnerId);

  return enrichPayload(
    req,
    {
      recordType: "stripe_checkout_completed",
      source: "contact_card_product_page",
      sourceDetail: "stripe_payment_link_checkout",
      sourceSystem: "stripe",
      destinationSystem: "ghost_lead_command",
      product: {
        family: "contact_card",
        selectedPlan: reference.selectedPlan,
        checkoutModel: "stripe_payment_link"
      },
      buyer: {
        email: session.customer_details?.email || session.customer_email || "",
        name: session.customer_details?.name || "",
        phone: session.customer_details?.phone || ""
      },
      referral: {
        program: "contact_card_associate",
        referralCode: reference.referralCode,
        referredByCardOwnerId: reference.referredByCardOwnerId,
        visitorId: reference.visitorId,
        eligible: isReferred,
        status: isPaid ? "payment_confirmed" : "pending_payment_confirmation"
      },
      commission: calculateCommission(amountTotal, session.currency, isPaid && isReferred),
      stripe: {
        eventId: event.id,
        eventType: event.type,
        mode: session.mode || "",
        checkoutSessionId: session.id,
        paymentStatus,
        paymentIntentId: session.payment_intent || "",
        subscriptionId: session.subscription || "",
        customerId: session.customer || "",
        paymentLinkId: session.payment_link || "",
        clientReferenceId: session.client_reference_id || ""
      }
    },
    "stripe_checkout_completed"
  );
}

function buildInvoicePaidPayload(req, event) {
  const invoice = event.data.object;
  const isPaid = invoice.status === "paid" || invoice.paid === true;
  const amountPaid = typeof invoice.amount_paid === "number" ? invoice.amount_paid : 0;

  return enrichPayload(
    req,
    {
      recordType: "stripe_invoice_paid",
      source: "contact_card_product_page",
      sourceDetail: "stripe_subscription_invoice",
      sourceSystem: "stripe",
      destinationSystem: "ghost_lead_command",
      commission: calculateCommission(amountPaid, invoice.currency, false),
      stripe: {
        eventId: event.id,
        eventType: event.type,
        invoiceId: invoice.id,
        subscriptionId: invoice.subscription || "",
        customerId: invoice.customer || "",
        paid: isPaid,
        billingReason: invoice.billing_reason || ""
      },
      note:
        "Invoice paid received. Match subscription/customer to the original referred checkout in Ghost before approving commission."
    },
    "stripe_invoice_paid"
  );
}

module.exports = async function handler(req, res) {
  setCors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return res.status(503).json({
      error: "Stripe webhook secret is not configured.",
      configured: false
    });
  }

  try {
    const rawBody = await readRawBody(req);
    verifyStripeSignature(rawBody, req.headers["stripe-signature"], webhookSecret);

    const event = JSON.parse(rawBody);
    let payload = null;

    if (event.type === "checkout.session.completed") {
      payload = buildCheckoutCompletedPayload(req, event);
    }

    if (event.type === "invoice.paid") {
      payload = buildInvoicePaidPayload(req, event);
    }

    if (!payload) {
      return res.status(200).json({ received: true, handled: false, eventType: event.type });
    }

    const forwardResult = await forwardToGhostLeadCommand(payload);
    return res.status(200).json({
      received: true,
      handled: true,
      forwarded: forwardResult.forwarded,
      reason: forwardResult.reason || null,
      recordType: payload.recordType
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
