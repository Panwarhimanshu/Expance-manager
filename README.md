# Stall Ledger — Byte Club

React + Node.js rebuild of the stall-day expense/sales tracker.

## Structure
- `server/` — Express API, data stored in MongoDB Atlas (via Mongoose)
- `client/` — React (Vite) frontend

## Setup

`server/.env` holds the database connection (already created, git-ignored):
```
MONGODB_URI="mongodb+srv://<user>:<password>@cluster0.aoxwwfg.mongodb.net"
MONGODB_DB="stall_ledger"
PORT=5000
```
Never commit this file — it's already listed in `.gitignore`.

## Run locally

Terminal 1:
```
cd server
npm install
npm start
```
You should see `Connected to MongoDB` in the console.

Terminal 2:
```
cd client
npm install
npm run dev
```

Open http://localhost:5173 (API calls are proxied to the server on port 5000).

## Build for production
```
cd client
npm run build
```
Serve the built `client/dist` folder with any static host, pointing `/api` at the running `server`.
