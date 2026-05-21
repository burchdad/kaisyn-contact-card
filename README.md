# Kaisyn Photography Contact Card

This repo is a photography-focused copy of the Smart QR Contact Card Template.

Most of Kaisyn's card-specific edits live in `card.config.js`. Replace the placeholder phone, email, booking link, social links, portfolio links, and profile/brand assets before publishing the final QR code.

The product referral funnel still points to Stephen's product page with Kaisyn's referral code:

```txt
https://stephenburch.app/contact-card-product?ref=kaisyn-photography
```

That keeps the card free for Kaisyn while still attributing future product sales back to him.

## Template Notes

This is a deployable contact-card template for networking, lead capture, referral attribution, and Ghost Lead Command routing.

This card is configured in `card.config.js`. To create another card for a different person or business, use the original template repo and update that config file.

See [TEMPLATE_SETUP.md](TEMPLATE_SETUP.md) for the full clone-and-configure flow.

## Template Config

Most card-specific edits live in:

```txt
card.config.js
```

Use `card.config.example.js` as the starting point for a new card owner.

Key fields:

- `profile`: name, phone, email, image, socials, services, work examples
- `card.ownerId`: unique owner ID for lead partitioning
- `card.referralCode`: commission/referral code used on product links
- `card.workspaceId`: future workspace/customer partition
- `card.sourceDetail`: lead source detail for Ghost Lead Command
- `productOffer.baseUrl`: Stephen's product funnel URL for commission sales

## Lead Source

Lead and event payloads use values from `card.config.js`:

- `source`: `qr_contact_card`
- `sourceDetail`: configured per card owner
- `sourceSystem`: `contact_card`
- `destinationSystem`: `ghost_lead_command`

This keeps QR/contact-card leads separate from PDL or other imported sources.

## Ghost Lead Command Webhook

Set these Vercel environment variables when Ghost Lead Command has an intake webhook:

- `GHOST_LEAD_COMMAND_WEBHOOK_URL`
- `GHOST_LEAD_COMMAND_WEBHOOK_SECRET` optional bearer token
- `STRIPE_WEBHOOK_SECRET` for `/api/stripe-webhook`

The frontend posts to:

- `/api/lead` for form submissions
- `/api/event` for anonymous page/click engagement events
- `/api/product-intake` for product sales-page intake submissions
- `/api/stripe-webhook` for Stripe payment confirmation and commission attribution

The "Save Contact" button generates a `.vcf` contact file with the configured card owner's email and phone number.

## Contact Card Product Funnel

The product sales page lives at `/contact-card-product`.

Product-funnel payloads use:

- `source`: `contact_card_product_page`
- `sourceDetail`: `qr_card_product_offer`
- `sourceSystem`: `contact_card_product_page`
- `destinationSystem`: `ghost_lead_command`

The product page uses Stripe Payment Links in `product.js`:

```js
const PRODUCT_STRIPE_PAYMENT_LINKS = {
  basic: "https://buy.stripe.com/00w5kF0PI5whaiAaET7AI03",
  premium: "https://buy.stripe.com/fZufZj6a21g14Yg5kz7AI02"
};
```

Basic includes contact, social, and project information. Premium includes everything in Basic plus the sales/leads funnel.
Customer-owned leads should be routed with a future `cardOwnerId` or `workspaceId`, not mixed into Stephen's personal `qr_contact_card` source.

## Referral / Commission Attribution

Contact-card product links can carry referral context:

```txt
/contact-card-product?ref=stephen-burch&cardOwnerId=stephen_burch
```

The card template builds that link from `card.config.js`. The product page stores the referral in browser storage, includes it on checkout-click events, and submits it with `/api/product-intake`.

Referral payload fields include:

- `referral.program`: `contact_card_associate`
- `referral.referralCode`
- `referral.referredByCardOwnerId`
- `referral.referredByWorkspaceId`
- `commission.rate`: `0.2`
- `commission.status`: `pending_payment_confirmation`

V1 commission tracking is attribution-only with manual payout review. A later Stripe Checkout/webhook flow should confirm the payment, calculate the final commission amount, and move the commission ledger record from `pending` to `approved` or `paid`.

Ownership rule: product buyer and referral data belongs in Stephen's Ghost AI Solutions sales system, while leads generated from a customer's finished card must belong to that customer's workspace.

## Stripe Webhook Setup

Payment Link checkout buttons append Stripe-supported URL parameters:

- `client_reference_id`: compact contact-card reference with plan, referral code, card owner, and visitor ID
- `utm_source`
- `utm_medium`
- `utm_campaign`

Create a Stripe webhook endpoint for:

```txt
https://stephenburch.app/api/stripe-webhook
```

Subscribe to:

- `checkout.session.completed`
- `invoice.paid`

`checkout.session.completed` confirms the signup and can approve commission immediately when the session is paid and has a referred `client_reference_id`. If checkout starts a free trial, the commission remains `pending_payment_confirmation`.

`invoice.paid` is captured for subscription payments after a trial. In v1, match the invoice's Stripe customer/subscription back to the original referred checkout record in Ghost Lead Command before approving payout.
