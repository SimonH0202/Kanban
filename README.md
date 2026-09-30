# Kanban App

A full-stack Kanban application for organizing tasks and collaborating on shared boards.

**Live app:** [kanban.simon-hoeglinger.me](https://kanban.simon-hoeglinger.me)

## Features

- Create, rename, and delete boards, columns, and cards
- Organize cards with drag-and-drop within and between columns
- Add descriptions, due dates, and colored tags to cards
- Share boards with verified users by email
- View board owners and members
- Manage board membership as the owner
- Register and log in with email and password
- Verify email addresses through single-use, expiring links
- Resend verification emails
- Use the application on desktop and mobile

Board owners manage board settings and membership. Members can collaborate on tasks, columns, and tags.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | Vue 3, TypeScript, Pinia, Vue Router, Tailwind CSS |
| Drag-and-drop | vue-draggable-next |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL, Prisma ORM |
| Authentication | JWT in HTTP-only cookies, bcrypt |
| Email | Resend |
| Hosting | Vercel, Render, Prisma Postgres |

## Project Structure

```text
client/
  src/
    api/          API client
    components/   Boards, cards, editors, and overlays
    router/       Routes and navigation guards
    stores/       Pinia stores
    types/        TypeScript types
    views/        Application pages

server/
  prisma/
    migrations/   Database migrations
    schema.prisma Database schema
  src/
    authorization/
    middleware/
    util/
    prisma.ts
    server.ts
```

## Local Development

### Prerequisites

- Node.js satisfying the version requirement in `client/package.json`
- npm
- A PostgreSQL database
- A Resend API key and verified sending domain

### 1. Clone the repository

```bash
git clone https://github.com/SimonH0202/Kanban.git
cd Kanban
```

### 2. Configure the backend

Create `server/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
JWT_SECRET="YOUR_RANDOM_SECRET"
RESEND_API_KEY="YOUR_RESEND_API_KEY"
EMAIL_FROM="Kanban <noreply@YOUR_VERIFIED_DOMAIN>"
FRONTEND_URL="http://localhost:5173"
PORT=3000
NODE_ENV=development
```

Keep credentials private and do not commit `.env` files.

Ensure these variables are loaded into the backend process. Recent Node.js versions can load the file directly with the `--env-file` option.

### 3. Install backend dependencies and prepare the database

From the `server` directory:

```bash
npm ci
npx prisma generate
npx prisma migrate deploy
```

`migrate deploy` applies the migrations already committed to the repository. When developing new schema changes locally, use `prisma migrate dev`.

### 4. Start the backend

From the `server` directory:

```bash
node --env-file=.env --import tsx src/server.ts
```

The API runs at `http://localhost:3000`.

### 5. Configure and start the frontend

Create `client/.env.local`:

```env
VITE_API_URL=http://localhost:3000
```

From the `client` directory:

```bash
npm ci
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

### 6. Create an account

Register with an email address you can access, open the verification email, and confirm your address before logging in.

## Production Builds

Frontend, from `client`:

```bash
npm run build
```

Backend, from `server`:

```bash
npx prisma generate
npm run build
npm start
```

Apply pending database migrations as part of the deployment process:

```bash
npx prisma migrate deploy
```

## Deployment

The application is deployed using:

- **Vercel** for the Vue frontend
- **Render** for the Express API
- **Prisma Postgres** for the database
- **Resend** for verification emails

The frontend requires `VITE_API_URL` at build time. The backend requires its database, authentication, and email environment variables at runtime.

Production configuration includes HTTPS, secure authentication cookies, CORS configured for the frontend origin, and SPA routing fallback for direct links and page refreshes.

## Project Status

This is a personal portfolio project under active development. Deployment is live; further improvements to concurrency handling, validation, and automated testing are planned.

## Author

**Simon Höglinger**

[Portfolio](https://simon-hoeglinger.me) · [GitHub](https://github.com/SimonH0202)
