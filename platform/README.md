# Shubh Nimantran

Online Indian wedding invitation platform. Customers pick a design, add their details,
pay by UPI and receive their own invitation link (`/invite/rahul-weds-priya`).

## What is inside

| Folder | What it holds |
|---|---|
| `app/` | Every page of the website, the admin dashboard and the customer dashboard |
| `templates/` | The invitation designs (one `.html` file each) |
| `lib/` | The logic: login, database access, building an invitation from a design |
| `supabase/migrations/` | The database structure (one SQL file) |

Built with Next.js (website) and Supabase (database, login, private photo storage).

## Putting it online (about 15 minutes, free)

### 1. Supabase: the database
1. Create a free account at supabase.com and click **New project**. Choose the Mumbai region.
2. Open **SQL Editor**, paste the whole file `supabase/migrations/20261115000000_init.sql`, press **Run**.
3. Open **Authentication → Sign In / Providers → Email** and turn **Confirm email** off.
   (Without your own domain you cannot send confirmation emails to customers yet.)
4. Open **Project Settings → API Keys** and keep the page open for the next step.

### 2. Vercel: the website
1. Create a free account at vercel.com using your GitHub login.
2. **Add New → Project**, choose the `wedding` repository.
3. Set **Root Directory** to `platform`.
4. Add the four environment variables listed in `env.example`.
   `ADMIN_EMAILS` is your own email address.
5. Press **Deploy**. Vercel gives you a free address like `shubh-nimantran.vercel.app`.

### 3. First visit
1. Open your new address and **create an account with the admin email straight away**.
   That account sees the **Admin** link.
2. In **Admin → Settings** enter your UPI ID so customers can pay.

## How payment works (no gateway)
The customer scans your UPI QR, pays, and types the transaction ID. The order waits in
**Admin → Overview**. You find the payment in your UPI app and press **Approve**; the
invitation goes live and the customer sees their link. Nothing is ever marked paid
automatically, and the same transaction ID cannot be used twice.

## Adding a new design
**Admin → Designs → Add a new design** and upload the design's `.html` file. A design file
is an ordinary web page that uses placeholders such as `{{groom.name}}`; the three files in
`templates/` are working examples.

## Before a public launch
- Buy a domain and connect it in Vercel.
- Set up email sending (for example Resend) and turn **Confirm email** back on.
- Have the privacy policy, terms and refund pages reviewed; they are marked as drafts.
- Replace manual UPI checking with a payment gateway (Razorpay) if order volume grows.
