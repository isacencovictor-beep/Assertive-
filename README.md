# AuthApp (Express + EJS)

A minimal example site with registration and login using Express, EJS, sessions, CSRF protection, and a simple JSON database.

## Run

- Copy `.env` and set a strong `SESSION_SECRET`.
- Install dependencies (already installed here):

```bash
npm install
```

- Start the app:

```bash
npm run start
```

Then open `http://localhost:3000`.

## Notes

- Data is stored in `data/db.json` via lowdb (for demo/dev only).
- CSRF protection is enabled; all forms include a hidden token.
- Do not use the in-memory session store in production.