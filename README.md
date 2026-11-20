# Vanguard & Sterling Advisory

The public website is an Angular application based on the original root `index.html` design. Content is served by Vercel API functions backed by Supabase. The `/admin` route provides authenticated CRUD screens for site content and enquiry submissions.

## Local development

Install dependencies and start the Angular site and local API together:

```sh
npm install
npm run dev
```

Open the local site at `http://localhost:4200`. The local API loads `.env.local` if present, otherwise `.env`; either file can hold the Supabase values below. `npm run dev:angular` starts only the Angular UI and does not run the API.

## Supabase setup

1. Create a Supabase project and enable Email/Password sign-in in **Authentication → Providers**.
2. In the Supabase SQL Editor, run `supabase/migrations/20261120100000_initial_content_schema.sql`, then `supabase/migrations/20261120130000_grant_api_role_privileges.sql`, then `supabase/seed.sql`. If the first migration and seed are already applied, run the grant migration now.
3. Create the first user in **Authentication → Users**. Copy that user's ID and grant admin access:

   ```sql
   insert into public.admin_users (user_id)
   values ('AUTH_USER_UUID')
   on conflict (user_id) do nothing;
   ```

   No admin credentials are stored or seeded in this repository.
4. Configure the following environment variables in `.env.local` for local development and in Vercel for deployment:

   | Variable | Supabase value |
   | --- | --- |
   | `SUPABASE_URL` | Project URL |
   | `SUPABASE_ANON_KEY` | Project API anon/public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Project service-role key |

   The service-role key is used only by serverless API functions. Never add it to Angular source or expose it as a `VITE_`/`NG_` browser variable.

## Vercel deployment

Import the project into Vercel, add all three environment variables for the deployment environments you use, then deploy. `vercel.json` configures the Angular build output and `/admin` SPA rewrites; the `api/` directory is deployed as serverless functions.

After deployment, visit `/admin` and sign in with the Supabase user that was granted a row in `public.admin_users`. The dashboard provides separate create, edit, and delete screens for each configured resource, including contact messages and consultation requests.

## Validation

```sh
npm run typecheck
npm run build
```
