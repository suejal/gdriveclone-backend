# Cloud Drive — backend (Day 1)

1. copy `.env.example` to `.env` and fill in values
2. npm install
3. npm run dev

Endpoints:
- GET /api/ -> health
- GET /api/ping-supabase -> checks supabase connectivity (will query `users` table)

Notes:
- Use `SUPABASE_SERVICE_KEY` only on the server. Do not expose it in the frontend.
- To generate supabase typed declarations run `npm run gen:supabase:types` after setting `SUPABASE_PROJECT_ID` in your env.