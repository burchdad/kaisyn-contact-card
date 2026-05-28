const PRODUCT_STRIPE_PAYMENT_LINKS = {
  basic: "https://buy.stripe.com/00w5kF0PI5whaiAaET7AI03",
  premium: "https://buy.stripe.com/fZufZj6a21g14Yg5kz7AI02"
};

const PRODUCT_PLANS = {
  basic: {
    name: "Basic Contact Card",
    includes: [
      "contact_information",
      "social_information",
      "project_information",
      "calendar_booking_integration"
    ]
  },
  premium: {
    name: "Premium Contact Card + Lead Funnel",
    includes: [
      "contact_information",
      "social_information",
      "project_information",
      "sales_leads_funnel"
    ]
  }
};

const productSourceContext = {
  source: "contact_card_product_page",
  sourceDetail: "qr_card_product_offer",
  sourceSystem: "contact_card_product_page",
  destinationSystem: "ghost_lead_command"
};

const productVisitorKey = "ghostProductVisitorId";
const productReferralKey = "ghostProductReferralAttribution";
const referralProgram = {
  name: "contact_card_associate",
  defaultCommissionRate: 0.2,
  payoutModel: "first_payment_manual_review",
  status: "pending_payment_confirmation"
};

function getProductVisitorId() {
  const existing = window.localStorage.getItem(productVisitorKey);
  if (existing) return existing;

  const generated =
    window.crypto && window.crypto.randomUUID
      ? window.crypto.randomUUID()
      : `product_visitor_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  window.localStorage.setItem(productVisitorKey, generated);
  return generated;
}

function getProductAttribution() {
  const params = new URLSearchParams(window.location.search);
  return {
    visitorId: getProductVisitorId(),
    source: params.get("utm_source") || productSourceContext.source,
    sourceDetail: params.get("utm_campaign") || productSourceContext.sourceDetail,
    sourceMedium: params.get("utm_medium") || "product_qr_or_direct",
    referrer: document.referrer || "",
    landingPage: window.location.href,
    pageTitle: document.title
  };
}

function cleanReferralValue(value) {
  return value ? value.trim().slice(0, 120) : "";
}

function getStoredReferral() {
  try {
    const stored = window.localStorage.getItem(productReferralKey);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    return null;
  }
}

function setStoredReferral(referral) {
  window.localStorage.setItem(productReferralKey, JSON.stringify(referral));
}

function toStripeReferenceSegment(value, fallback) {
  const cleaned = cleanReferralValue(value)
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  return cleaned || fallback;
}

function buildStripeReference(plan, referral) {
  const visitorSegment = toStripeReferenceSegment(getProductVisitorId(), "visitor").slice(0, 36);
  const parts = [
    "cc",
    toStripeReferenceSegment(plan, "plan"),
    toStripeReferenceSegment(referral.referralCode, "direct"),
    toStripeReferenceSegment(referral.referredByCardOwnerId, "noowner"),
    visitorSegment
  ];
  return parts.join("__").slice(0, 200);
}

function buildCheckoutUrl(paymentLink, plan, referral) {
  const attribution = getProductAttribution();
  const url = new URL(paymentLink);
  url.searchParams.set("client_reference_id", buildStripeReference(plan, referral));
  url.searchParams.set("utm_source", attribution.source);
  url.searchParams.set("utm_medium", attribution.sourceMedium);
  url.searchParams.set("utm_campaign", attribution.sourceDetail);
  return url.toString();
}

function getProductReferral() {
  const params = new URLSearchParams(window.location.search);
  const referralCode = cleanReferralValue(
    params.get("ref") || params.get("referralCode") || params.get("affiliate")
  );
  const cardOwnerId = cleanReferralValue(params.get("cardOwnerId") || params.get("owner"));
  const workspaceId = cleanReferralValue(params.get("workspaceId"));
  const existing = getStoredReferral();

  if (referralCode || cardOwnerId || workspaceId) {
    const referral = {
      program: referralProgram.name,
      referralCode: referralCode || existing?.referralCode || "",
      referredByCardOwnerId: cardOwnerId || existing?.referredByCardOwnerId || "",
      referredByWorkspaceId: workspaceId || existing?.referredByWorkspaceId || "",
      eligible: true,
      commissionRate: referralProgram.defaultCommissionRate,
      payoutModel: referralProgram.payoutModel,
      status: referralProgram.status,
      firstSeenAt: existing?.firstSeenAt || new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      landingPage: window.location.href
    };
    setStoredReferral(referral);
    return referral;
  }

  if (!existing) {
    return {
      program: referralProgram.name,
      referralCode: "",
      referredByCardOwnerId: "",
      referredByWorkspaceId: "",
      eligible: false,
      commissionRate: 0,
      payoutModel: referralProgram.payoutModel,
      status: "not_referred"
    };
  }

  const referral = {
    ...existing,
    lastSeenAt: new Date().toISOString()
  };
  setStoredReferral(referral);
  return referral;
}

function trackProductEvent(eventName, metadata = {}) {
  fetch("/api/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventName,
      metadata,
      occurredAt: new Date().toISOString(),
      ...productSourceContext,
      attribution: getProductAttribution(),
      referral: getProductReferral()
    }),
    keepalive: true
  }).catch(() => {});
}

function initCheckoutButtons() {
  const buttons = document.querySelectorAll(".plan-checkout");
  const status = document.querySelector("#checkoutStatus");
  const selectedPlan = document.querySelector("#selectedPlan");
  if (!buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const plan = button.dataset.plan;
      const paymentLink = PRODUCT_STRIPE_PAYMENT_LINKS[plan];
      const referral = getProductReferral();
      selectedPlan.value = plan;

      trackProductEvent("stripe_payment_link_clicked", {
        plan,
        planName: PRODUCT_PLANS[plan]?.name,
        configured: Boolean(paymentLink),
        stripeClientReferenceId: buildStripeReference(plan, referral),
        referral
      });

      if (paymentLink) {
        window.open(buildCheckoutUrl(paymentLink, plan, referral), "_blank", "noopener,noreferrer");
        status.textContent =
          "Stripe checkout opened. After payment, send the intake so Stephen can build your card.";
        return;
      }

      status.textContent =
        "Stripe checkout link is not connected yet. Send the intake and Stephen can finish setup.";
    });
  });
}

function initProductIntake() {
  const form = document.querySelector("#productIntakeForm");
  const status = document.querySelector("#productIntakeStatus");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "Sending...";

    const data = Object.fromEntries(new FormData(form).entries());
    const selectedPlan = data.selectedPlan || "not_selected";
    const referral = getProductReferral();
    const payload = {
      product: {
        name: PRODUCT_PLANS[selectedPlan]?.name || "Smart QR Contact Card",
        selectedPlan,
        includes: PRODUCT_PLANS[selectedPlan]?.includes || [],
        checkoutModel: "stripe_payment_link",
        workspaceMode: "separate_client_workspace",
        paymentLinkConfigured: Boolean(PRODUCT_STRIPE_PAYMENT_LINKS[selectedPlan])
      },
      referral,
      commission: {
        program: referralProgram.name,
        eligible: referral.eligible,
        rate: referral.commissionRate,
        payoutModel: referralProgram.payoutModel,
        status: referral.status,
        trigger: "stripe_payment_confirmation_required"
      },
      buyer: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        businessName: data.businessName,
        preferredHandle: data.preferredHandle,
        audience: data.audience,
        goal: data.goal,
        consent: data.consent === "on"
      },
      routing: {
        cardOwnerId: null,
        workspaceId: null,
        requiresCustomerWorkspace: true
      },
      ...productSourceContext,
      attribution: getProductAttribution(),
      submittedAt: new Date().toISOString()
    };

    try {
      const response = await fetch("/api/product-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Product intake failed");
      }

      status.textContent = result.forwarded
        ? "Got it. Stephen will follow up with the next setup step."
        : "Got it. Intake captured locally; Ghost Lead Command webhook still needs wiring.";
      form.reset();
      trackProductEvent("product_intake_submitted", { forwarded: result.forwarded });
    } catch (error) {
      status.textContent = "Something did not send. Call or text Stephen and he can grab it directly.";
      trackProductEvent("product_intake_error", { message: error.message });
    }
  });
}

initCheckoutButtons();
initProductIntake();
const initialReferral = getProductReferral();
if (initialReferral.eligible) {
  trackProductEvent("product_referral_attributed", {
    referral: initialReferral
  });
}
trackProductEvent("product_page_view");
