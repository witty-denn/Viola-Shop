# HNG15 Lesson 2 Shop

## Run
1. Install Node.js.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Add your Supabase and Mailgun values.
5. Run `npm run dev`.

## Supabase
Open SQL Editor and run `supabase.sql`.

## Google
In Supabase: Authentication -> Providers -> Google -> enable it.
Set the Google OAuth client ID/secret there.
Add your deployed site URL to Supabase Authentication URL configuration.

## Mailgun
Add MAILGUN_API_KEY, MAILGUN_DOMAIN and MAIL_FROM to your environment variables.
