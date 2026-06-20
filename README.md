## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## Backend Setup

1. Copy `server/.env.example` to `server/.env`.
2. Fill in your Firebase keys and other config values in `server/.env`.
3. Run `cd server && npm install` to install server deps.
4. Start the backend: `cd server && npm run dev`.

# TODO

- [x] Add Backend integration for User Login and Registration (supabase recommended)
- [ ] Add Account Deletion Option
- [x] Update User Profile
- [x] \*Adding Payment integration for subscribing to a plan (Razorpay recommended)
- [x] \*RazorPay Integration
- [ ] Implement AI credit
- [ ] Pricing Discussion
- [ ] Migrate Express JS to Koa/Nest JS
- [x] Fix the auto-layout to make the diagram more organize
- [x] Add T&C , Refund Policy, Privacy and Policy, etc.
- [ ] Organize T&C , Refund Policy, Privacy and Policy, etc.
- [ ] Fix Template Issue
- [ ] Add SEO
- [ ] GEO (optional)
- [ ] GDRP (cookies)
- [ ] Use app.vnflo.com subdomain for dashboard
- [ ] Need to Set up custom SMTP
- [x] Auth - Need to change email sign-up to google-sign and redirect to pricing page(if users is already in premium plan redirect to dashboard)
