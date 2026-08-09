# Raja Electricals

A clean monorepo — **React frontend** and **Express + MongoDB backend** are separated into two folders, but still served from one address.

```
main electric/
├── client/          # React + Vite frontend (the website)
│   ├── index.html
│   ├── vite.config.mjs
│   ├── package.json
│   └── src/
│       ├── pages/       # Home, About, Products, Projects, Gallery, Brands, Contact, Dashboard
│       ├── components/  # Layout (Header/Footer), shared UI
│       ├── lib/api.js   # fetch helpers for /api
│       ├── data/        # static image URLs
│       └── *.css
├── server/          # Express API + MongoDB backend
│   ├── server.js    # all /api routes, auth, DB models
│   ├── package.json
│   ├── .env         # MONGODB_URI, JWT_SECRET, ADMIN_*
│   ├── .env.example
│   └── data/        # local data files
├── package.json     # root scripts (workspaces)
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## How it works

- **http://localhost:4000** serves the built React website **and** the `/api` — same address, no CORS.
- `/api/*` routes talk to **MongoDB** (content, products, brands, enquiries, orders, admin auth).
- The frontend calls relative `/api` paths, so the proxy config in `client/vite.config.mjs` is only used for frontend-only hot reload.

## Local development

1. Start MongoDB:
   ```
   docker compose up -d mongo
   ```
2. Create `server/.env` from `server/.env.example` and set your values:
   ```
   MONGODB_URI=mongodb://127.0.0.1:27017/raja-electricals
   JWT_SECRET=<a-long-random-secret>
   ADMIN_EMAIL=admin@rajaelectricals.in
   ADMIN_PASSWORD=<a-strong-password>
   ```
3. Install and build (from the root):
   ```
   npm install
   npm run dev
   ```
   This builds the React app into `client/dist` and starts the server.

4. Open **http://localhost:4000**
   - Website: `http://localhost:4000`
   - Admin dashboard: `http://localhost:4000/#dashboard`

### Optional: frontend-only hot reload

```
npm run dev:client
```

Starts Vite on port 5173. It proxies `/api` to the API server on port 4000. The API server must already be running (`npm run dev:server`).

## Deploy with Docker

1. Set a strong `JWT_SECRET` and `ADMIN_PASSWORD` in `.env` (root).
2. Build and start:
   ```
   docker compose up --build -d
   ```
3. Open `http://localhost:4000`.

Only port 4000 is exposed. MongoDB is private to Docker and persists in the `mongo_data` volume.

## Scripts (from root)

| Command            | What it does                                   |
| ------------------ | ---------------------------------------------- |
| `npm run dev`      | Builds the client + starts the server on :4000 |
| `npm run build`    | Builds the React client into `client/dist`     |
| `npm start`        | Starts the API server only                     |
| `npm run dev:client` | Vite dev server (hot reload, port 5173)     |
| `npm run dev:server` | Node server only (port 4000)                |
| `npm run deploy`   | Build + start (used by Docker)                 |
