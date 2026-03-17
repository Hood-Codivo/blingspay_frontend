# BlingsPay Frontend

Merchant-facing frontend for BlingsPay crypto checkout and dashboard.

## Local development

Requirements:

- Node.js 18+
- npm

Install and run:

```sh
npm install
npm run dev
```

## Scripts

- `npm run dev` — start the Vite development server
- `npm run build` — create a production build
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint
- `npm run test` — run tests once with Vitest
- `npm run test:watch` — run tests in watch mode

## Tech stack

- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Solana wallet adapter

## Deploy

Build the app with:

```sh
npm run build
```

Then deploy the generated `dist/` folder with your hosting provider or existing Vercel setup.
