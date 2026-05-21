# Contact Card Template Setup

Use this repo as a GitHub template when you want a new person or business to have their own deployable card.

## 1. Create a New Repo From This Template

In GitHub:

1. Open this repository.
2. Go to `Settings`.
3. Enable `Template repository`.
4. Use `Use this template` to create a new repo for the new card owner.

Recommended repo names:

```txt
kaisyn-photography-contact-card
client-name-contact-card
```

## 2. Update the Card Owner Config

Edit `card.config.js`.

The important ownership fields are:

```js
card: {
  ownerId: "kaisyn_photography",
  referralCode: "kaisyn-photography",
  workspaceId: "kaisyn-photography",
  sourceDetail: "kaisyn_photography_contact_card"
}
```

These values separate the card owner's leads and attach commission attribution when someone buys through their card.

## 3. Keep Commission Sales Pointed to Stephen's Product Funnel

For a free associate/commission card, keep this pointed at Stephen's product page:

```js
productOffer: {
  baseUrl: "https://stephenburch.app/contact-card-product",
  utmSource: "qr_contact_card",
  utmMedium: "referral_offer",
  utmCampaign: "kaisyn_photography_card",
  displayUrl: "stephenburch.app/contact-card-product?ref=kaisyn-photography"
}
```

The template will automatically generate product links like:

```txt
https://stephenburch.app/contact-card-product?ref=kaisyn-photography&cardOwnerId=kaisyn_photography&workspaceId=kaisyn-photography
```

Stripe checkout stores that referral in `client_reference_id`, then the webhook forwards the commission context into Ghost Lead Command.

## 4. Add the Card Owner's Assets

Place the profile image in `assets/`, then update:

```js
photo: "assets/profile.jpg"
```

Optional brand logo:

```js
brand: {
  name: "Kaisyn Photography",
  url: "https://example.com",
  logo: "assets/logo.png"
}
```

## 5. Set Vercel Environment Variables

For the new card deployment, set:

```txt
GHOST_LEAD_COMMAND_WEBHOOK_URL=https://ghost-lead-command.vercel.app/api/webhooks/contact-card
GHOST_LEAD_COMMAND_WEBHOOK_SECRET=shared-secret-from-ghost-lead-command
```

Only Stephen's product funnel deployment needs:

```txt
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 6. Ownership Rule

Card-owner leads belong to the card owner:

```txt
source=qr_contact_card
sourceDetail=kaisyn_photography_contact_card
workspaceId=kaisyn-photography
```

Product buyers belong to Ghost AI Solutions, with referral credit attached:

```txt
source=contact_card_product_page
referralCode=kaisyn-photography
referredByCardOwnerId=kaisyn_photography
```

