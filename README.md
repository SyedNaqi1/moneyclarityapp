# Money Clarity — moneyclarityapp

A polished Next.js 14 + TypeScript MVP based on the supplied Money Clarity product, customer-needs, technical-architecture and website-design documents.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## What is included

- Responsive marketing landing page
- Dashboard with KPI cards, action-needed feed and charts
- Transactions list with search/filtering
- Fast Add Transaction modal
- CSV import preview flow
- Customers, Suppliers, Categories, Rules and Insights screens
- Settings screen
- Mobile bottom navigation
- Local demo persistence via localStorage so the UI works immediately without a database
- Clean API-ready data model/types for later Supabase/PostgreSQL + Prisma integration

## Production backend

The supplied architecture calls for Next.js, TypeScript, PostgreSQL/Prisma, secure auth, receipt storage and API routes. This frontend intentionally ships as a runnable MVP shell with local demo data; connect those services before production use.
