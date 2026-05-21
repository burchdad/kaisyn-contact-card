const profile = {
  name: "Stephen Burch",
  role: "Growth Systems Builder",
  positioning: "Business Growth Systems / AI / Web / Revenue Ops",
  tagline:
    "I help businesses go from getting started to generating revenue with the strategy, software, content, automation, and marketing systems needed to keep growing after launch.",
  email: "stephen.burch@ghostai.solutions",
  phone: "+19037074281",
  phoneDisplay: "903-707-4281",
  location: "Tyler, Texas",
  website: "https://stephenburch.app",
  scheduleUrl: "https://cal.read.ai/ghost-ai-solutions",
  photo: "assets/stephen-burch-profile.jpg",
  socials: [
    {
      label: "LinkedIn",
      handle: "stephenburch1",
      url: "https://www.linkedin.com/in/stephenburch1/"
    },
    {
      label: "GitHub",
      handle: "burchdad",
      url: "https://github.com/burchdad"
    },
    {
      label: "X",
      handle: "@ghostaiso",
      url: "https://x.com/ghostaiso"
    },
    {
      label: "Instagram",
      handle: "@burchsl4",
      url: "https://www.instagram.com/burchsl4/"
    },
    {
      label: "Facebook",
      handle: "burchsl",
      url: "https://www.facebook.com/burchsl/"
    }
  ],
  apps: [
    {
      name: "Ghost Lead Command",
      type: "Lead command center",
      description: "A SaaS-style lead operations interface for managing pipeline signals and next actions.",
      url: "https://ghost-lead-command.vercel.app/"
    },
    {
      name: "Peptides Ecommerce",
      type: "Commerce experience",
      description: "A storefront build focused on product browsing, trust signals, and conversion flow.",
      url: "https://peptides-ecommerce.vercel.app/"
    },
    {
      name: "Consult Prototype",
      type: "Consulting workflow",
      description: "A prototype for packaging expertise, intake, and service delivery into a web app experience.",
      url: "https://consult-prototype.vercel.app/"
    },
    {
      name: "Wedding Package",
      type: "Service package site",
      description: "A polished package presentation flow for service discovery and inquiry generation.",
      url: "https://wedding-package.vercel.app/"
    },
    {
      name: "Alpha Ghost",
      type: "Brand platform",
      description: "A public brand site built around authority, positioning, and direct conversion paths.",
      url: "https://www.alphaghost.org/"
    },
    {
      name: "Blue Anchor Seafood",
      type: "Business website",
      description: "A local business web presence designed for credibility, discovery, and customer action.",
      url: "https://blueanchorseafood.com/"
    },
    {
      name: "Piddy",
      type: "Product prototype",
      description: "A compact product build exploring focused app interaction and rapid web delivery.",
      url: "https://piddy.vercel.app/"
    }
  ],
  services: [
    {
      name: "Launch Presence",
      description: "Websites, landing pages, brand positioning, and conversion paths that make a business credible fast."
    },
    {
      name: "Search Visibility",
      description: "SEO, AEO, GEO, local discovery, and content systems built for how people and AI tools find answers."
    },
    {
      name: "Demand Generation",
      description: "Social media management, Google Ads, social ads, creative testing, and campaign infrastructure."
    },
    {
      name: "Automation Layer",
      description: "AI integrations, workflow automations, lead handling, CRM support, and operational shortcuts."
    },
    {
      name: "Product Builds",
      description: "Mobile apps, SaaS builds, dashboards, portals, prototypes, and internal tools that move the business."
    },
    {
      name: "Growth Operations",
      description: "The connective tissue after launch: measurement, iteration, systems cleanup, and revenue-focused execution."
    }
  ],
  projects: [
    {
      name: "Ghost AI Solutions",
      description: "Public-facing AI systems and automation work under the Ghost AI Solutions banner.",
      url: "https://github.com/burchdad/ghostaisolutions"
    },
    {
      name: "GhostBot Chat",
      description: "Chat interface work for AI assistants and conversational product experiences.",
      url: "https://github.com/burchdad/ghostbot-chat"
    },
    {
      name: "GhostVoiceGPT",
      description: "Voice AI experimentation and agent-style interaction patterns.",
      url: "https://github.com/burchdad/GhostVoiceGPT"
    },
    {
      name: "Ghost CRM",
      description: "Operational CRM tooling shaped around AI-assisted workflows.",
      url: "https://github.com/burchdad/ghostcrm"
    },
    {
      name: "GhostTable",
      description: "Structured data tooling for workflow control and lightweight operating systems.",
      url: "https://github.com/burchdad/ghosttable"
    },
    {
      name: "AI Portfolio",
      description: "Portfolio hub for AI projects, experiments, and practical builds.",
      url: "https://github.com/burchdad/ai_portfolio"
    }
  ]
};

const templateConfig = window.CONTACT_CARD_CONFIG || {};
if (templateConfig.profile) {
  Object.assign(profile, templateConfig.profile);
}

const $ = (selector) => document.querySelector(selector);
const cardConfig = {
  ownerId: "stephen_burch",
  referralCode: "stephen-burch",
  workspaceId: "ghost-ai-solutions",
  sourceDetail: "stephen_burch_networking_card",
  ...(templateConfig.card || {})
};
const sourceContext = {
  source: "qr_contact_card",
  sourceDetail: cardConfig.sourceDetail,
  sourceSystem: "contact_card",
  destinationSystem: "ghost_lead_command"
};
const productOffer = {
  baseUrl: `${profile.website}/contact-card-product`,
  utmSource: "qr_contact_card",
  utmMedium: "referral_offer",
  utmCampaign: cardConfig.sourceDetail,
  displayUrl: "",
  ...(templateConfig.productOffer || {})
};
const productReferralUrl = buildProductReferralUrl();
const productIntakeUrl = `${productReferralUrl}#productIntakeForm`;

function buildProductReferralUrl() {
  const url = new URL(productOffer.baseUrl, window.location.origin);
  url.searchParams.set("ref", cardConfig.referralCode);
  url.searchParams.set("cardOwnerId", cardConfig.ownerId);
  if (cardConfig.workspaceId) {
    url.searchParams.set("workspaceId", cardConfig.workspaceId);
  }
  url.searchParams.set("utm_source", productOffer.utmSource);
  url.searchParams.set("utm_medium", productOffer.utmMedium);
  url.searchParams.set("utm_campaign", productOffer.utmCampaign);
  return url.toString();
}

function getVisitorId() {
  const key = "ghostLeadVisitorId";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;

  const generated =
    window.crypto && window.crypto.randomUUID
      ? window.crypto.randomUUID()
      : `visitor_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  window.localStorage.setItem(key, generated);
  return generated;
}

function getAttribution() {
  const params = new URLSearchParams(window.location.search);
  return {
    visitorId: getVisitorId(),
    source: params.get("utm_source") || sourceContext.source,
    sourceDetail: params.get("utm_campaign") || sourceContext.sourceDetail,
    sourceMedium: params.get("utm_medium") || "qr_or_direct",
    referrer: document.referrer || "",
    landingPage: window.location.href,
    pageTitle: document.title
  };
}

function trackEvent(eventName, metadata = {}) {
  const payload = {
    eventName,
    metadata,
    occurredAt: new Date().toISOString(),
    ...sourceContext,
    attribution: getAttribution()
  };

  fetch("/api/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true
  }).catch(() => {});
}

function initialsFor(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function setText(selector, value) {
  const node = $(selector);
  if (node) node.textContent = value;
}

function renderProfile() {
  document.title = `${profile.name} | ${profile.role}`;
  setText("#name", profile.name);
  setText("#role", `${profile.role} / ${profile.positioning}`);
  setText("#tagline", profile.tagline);
  setText("#locationText", profile.location);
  setText("#initialsFallback", initialsFor(profile.name));
  setText("#contactDialogTitle", `Contact ${profile.name.split(" ")[0] || profile.name}`);

  $("#emailLink").href = `mailto:${profile.email}`;
  $("#phoneLink").href = `tel:${profile.phone}`;
  $("#smsLink").href = `sms:${profile.phone}`;
  $("#scheduleLink").href = profile.scheduleUrl;

  const photo = $("#profilePhoto");
  photo.src = profile.photo;
  photo.alt = `${profile.name} portrait`;
  photo.addEventListener("error", () => {
    photo.classList.add("is-hidden");
    $("#initialsFallback").classList.add("is-visible");
  });

  const brandLink = $("#brandLink");
  const brandLogo = $("#brandLogo");
  const brandName = $("#brandName");
  if (profile.brand && brandLink && brandLogo && brandName) {
    brandLink.href = profile.brand.url;
    brandLogo.src = profile.brand.logo;
    brandLogo.alt = "";
    brandName.textContent = profile.brand.name;
  }
}

function renderProductOffer() {
  const productLinks = document.querySelectorAll("[data-product-referral-link]");
  productLinks.forEach((link) => {
    link.href = link.dataset.productReferralLink === "intake" ? productIntakeUrl : productReferralUrl;
  });
  setText("#productReferralDisplay", productOffer.displayUrl || productReferralUrl);
  setText(
    "#qrShareCopy",
    `Scan, save, and jump straight to ${profile.name.split(" ")[0] || profile.name}'s profile.`
  );
}

function renderLinks() {
  const socialLinks = $("#socialLinks");
  socialLinks.innerHTML = profile.socials
    .map(
      (social) => `
        <a class="social-card" href="${social.url}" target="_blank" rel="noreferrer">
          <strong>${social.label}</strong>
          <span>${social.handle}</span>
        </a>
      `
    )
    .join("");

  const projectLinks = $("#projectLinks");
  projectLinks.innerHTML = profile.projects
    .map(
      (project) => `
        <a class="project-card" href="${project.url}" target="_blank" rel="noreferrer">
          <strong>${project.name}</strong>
          <span>${project.description}</span>
        </a>
      `
    )
    .join("");

  const appLinks = $("#appLinks");
  appLinks.innerHTML = profile.apps
    .map(
      (app) => `
        <a class="app-card" href="${app.url}" target="_blank" rel="noreferrer">
          <span class="app-type">${app.type}</span>
          <strong>${app.name}</strong>
          <span>${app.description}</span>
        </a>
      `
    )
    .join("");

  const serviceLinks = $("#serviceLinks");
  serviceLinks.innerHTML = profile.services
    .map(
      (service) => `
        <div class="service-card">
          <strong>${service.name}</strong>
          <span>${service.description}</span>
        </div>
      `
    )
    .join("");
}

function initLeadForm() {
  const form = $("#leadForm");
  const status = $("#leadStatus");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "Sending...";

    const data = Object.fromEntries(new FormData(form).entries());
    const payload = {
      lead: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        goal: data.goal,
        consent: data.consent === "on"
      },
      source: sourceContext.source,
      sourceDetail: sourceContext.sourceDetail,
      sourceSystem: sourceContext.sourceSystem,
      destinationSystem: sourceContext.destinationSystem,
      attribution: getAttribution(),
      submittedAt: new Date().toISOString()
    };

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Lead submission failed");
      }

      status.textContent = result.forwarded
        ? "Got it. I'll follow up soon."
        : "Got it. Lead captured locally; Ghost Lead Command webhook still needs wiring.";
      form.reset();
      trackEvent("lead_form_submitted", { forwarded: result.forwarded });
    } catch (error) {
      status.textContent = "Something didn't send. Text or call me and I'll grab it directly.";
      trackEvent("lead_form_error", { message: error.message });
    }
  });
}

function initModal(dialogSelector, openSelector, closeSelector, eventPrefix) {
  const dialog = $(dialogSelector);
  const openButton = $(openSelector);
  const closeButton = $(closeSelector);
  if (!dialog || !openButton || !closeButton) return;

  openButton.addEventListener("click", () => {
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
    trackEvent(`${eventPrefix}_modal_opened`);
  });

  closeButton.addEventListener("click", () => {
    dialog.close();
    trackEvent(`${eventPrefix}_modal_closed`);
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
      trackEvent(`${eventPrefix}_modal_closed`, { method: "backdrop" });
    }
  });
}

function initModals() {
  initModal("#contactDialog", "#openContactModal", "#closeContactModal", "contact");
  initModal("#leadDialog", "#openLeadModal", "#closeLeadModal", "lead");
  initModal("#socialDialog", "#openSocialModal", "#closeSocialModal", "social");
}

function initClickTracking() {
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    const button = event.target.closest("button");

    if (link) {
      trackEvent("link_clicked", {
        label: link.textContent.trim().replace(/\s+/g, " "),
        href: link.href,
        section: link.className || "link"
      });
    }

    if (button && button.id === "saveContact") {
      trackEvent("contact_saved");
    }
  });
}

function createVCard() {
  const [firstName, ...rest] = profile.name.split(" ");
  const lastName = rest.join(" ");
  const socialUrls = profile.socials.map((social) => `URL:${social.url}`);
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${lastName};${firstName};;;`,
    `FN:${profile.name}`,
    `TITLE:${profile.role}`,
    `EMAIL;TYPE=INTERNET:${profile.email}`,
    `TEL;TYPE=CELL:${profile.phone}`,
    `ADR;TYPE=WORK:;;;;${profile.location};;`,
    `URL:${profile.website}`,
    ...socialUrls,
    "END:VCARD"
  ];

  return lines.join("\n");
}

function downloadContact() {
  const blob = new Blob([createVCard()], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${profile.name.replace(/\s+/g, "-").toLowerCase()}.vcf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function renderQr(value) {
  const target = $("#qrCode");
  target.innerHTML = "";

  if (window.QRCode) {
    new QRCode(target, {
      text: value,
      width: 152,
      height: 152,
      correctLevel: QRCode.CorrectLevel.M
    });
    return;
  }

  target.textContent = "QR unavailable";
}

function renderInlineQr(selector, value) {
  const target = $(selector);
  if (!target) return;
  target.innerHTML = "";

  if (window.QRCode) {
    new QRCode(target, {
      text: value,
      width: 152,
      height: 152,
      correctLevel: QRCode.CorrectLevel.M
    });
    return;
  }

  target.textContent = "QR unavailable";
}

function initQr() {
  const input = $("#shareUrl");
  const defaultUrl = profile.website;

  input.value = defaultUrl;
  renderQr(defaultUrl);
  renderInlineQr("#productQrCode", productReferralUrl);
  input.addEventListener("input", () => renderQr(input.value || defaultUrl));
}

renderProfile();
renderProductOffer();
renderLinks();
initQr();
initModals();
initLeadForm();
initClickTracking();
trackEvent("page_view");
$("#saveContact").addEventListener("click", downloadContact);
