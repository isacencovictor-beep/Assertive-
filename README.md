# Auth Demo Web Site

This project is a simple full-stack example that demonstrates user registration, login, JWT authentication, and a small Bootstrap-powered UI.

## Tech Stack

* **Backend:** Node.js, Express, SQLite, JWT, bcrypt
* **Frontend:** Vanilla JavaScript, HTML, Bootstrap 5

## Prerequisites

* Node.js ≥ 18.x

## Getting Started

1. **Clone / open** this repo in your development environment.
2. **Backend setup**
   ```bash
   cd backend
   cp .env.example .env   # (optional) edit to change JWT secret / port
   npm install            # install dependencies
   npm start              # start the Express API on port 4000
   ```
3. **Frontend**
   The frontend is just static files. You can open `frontend/index.html` directly in your browser **or** serve it with a tiny static server e.g.
   ```bash
   npx serve frontend  # accessible at http://localhost:3000 by default
   ```
4. **Usage**
   * Register a new account on the Register tab.
   * Log in with the same credentials to receive a JWT stored in `localStorage`.
   * The Profile view fetches `/api/profile` with the token to display protected data.

## Endpoints

| Method | Endpoint        | Body                           | Description                    |
| ------ | --------------- | ------------------------------ | ------------------------------ |
| POST   | /api/register   | `{ username, password }`       | Create a new user & return JWT |
| POST   | /api/login      | `{ username, password }`       | Authenticate & return JWT      |
| GET    | /api/profile    | Auth: `Bearer <JWT>` header    | Return current user profile    |

## Security Notes

* Passwords are hashed with **bcrypt** before storage.
* JWT tokens expire after 1 hour; adjust in `server.js` if desired.
* For production use, store the SQLite file outside the repo and use HTTPS.

## License

MIT