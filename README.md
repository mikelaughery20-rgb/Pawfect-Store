# Pawfect Daily: deploy in ~5 minutes (Vercel, free tier)

BEFORE DEPLOYING: open public/index.html and replace the CONTACT email, phone and address near the bottom with your real details. Stripe checks them.

Stripe is the order database: paid orders and their fulfilment status
(Paid > Packed > Shipped > Delivered) are stored on Stripe Checkout Sessions.

1. Create a free account at vercel.com, then "Add New > Project > upload this folder"
   (or run `npx vercel` inside it).
2. In Project Settings > Environment Variables add:
   - STRIPE_SECRET_KEY = your Stripe secret key (starts sk_test_ for testing)
   - ADMIN_KEY         = a long password you choose (opens the Orders tab)
   - SITE_URL          = your site address, e.g. https://pawfect.vercel.app (optional)
3. Redeploy. Test with card 4242 4242 4242 4242, any future date and CVC.
4. Go live: activate your Stripe account, create the 4 products in live mode,
   set STRIPE_SECRET_KEY to your sk_live_ key, and set PRICE_IDS to JSON like
   {"1":{"price":"price_live...","cents":3400},"2":{...},"3":{...},"4":{...}}
