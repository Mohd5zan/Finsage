# FinSage --- AI-Powered Expense Copilot

FinSage is a full-stack expense management application that helps users
record expenses, scan receipts with AI-assisted data extraction, and
review monthly spending by category.

**Live Demo:** https://finsage-omega.vercel.app\
**GitHub:** https://github.com/Mohd5zan/Finsage

## Features

-   **User authentication:** Register and log in with JWT-based
    authentication and bcrypt password hashing.
-   **Expense management:** Create, view, update, and delete expenses.
-   **AI receipt scanning:** Upload a receipt image and use the Gemini
    API to extract details such as merchant, amount, tax, date, and
    category.
-   **Review before saving:** Check the extracted receipt details before
    confirming an expense.
-   **Monthly spending summary:** View spending totals for a selected
    month.
-   **Category breakdown:** Understand spending across expense
    categories.
-   **User-scoped data:** Expense queries are scoped to the
    authenticated user.
-   **Responsive frontend:** React and Tailwind CSS provide the
    application UI.
-   **Deployed application:** Frontend hosted on Vercel and backend API
    hosted on Render.

## Tech Stack

  Area             Technologies
  ---------------- ------------------------------------------
  Frontend         React, TypeScript, Vite, Tailwind CSS v4
  Backend          Node.js, Express, TypeScript
  Database         MongoDB Atlas, Mongoose
  Authentication   JSON Web Tokens (JWT), bcryptjs
  Validation       Zod
  AI integration   Google Gemini API (`@google/genai`)
  File uploads     Multer
  Deployment       Vercel (frontend), Render (backend)

## Architecture

``` text
React + Vite frontend
        |
        | HTTPS / REST API
        v
Node.js + Express backend
        |
        +---- MongoDB Atlas (users and expenses)
        |
        +---- Gemini API (receipt data extraction)
```

## Getting Started

### Prerequisites

Install the following before running the project locally:

-   Node.js and npm
-   A MongoDB database or MongoDB Atlas connection string
-   A Gemini API key for receipt scanning

### 1. Clone the repository

``` bash
git clone https://github.com/Mohd5zan/Finsage.git
cd Finsage
```

### 2. Configure the backend

Create `backend/.env`:

``` env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:5173
```

Use your own values. Never commit `.env` files or publish database
credentials, JWT secrets, or API keys.

Install dependencies and start the backend:

``` bash
cd backend
npm install
npm run dev
```

The backend runs on `http://localhost:5000` by default.

### 3. Configure the frontend

In a second terminal, from the repository root, create `frontend/.env`:

``` env
VITE_API_URL=http://localhost:5000
```

Install dependencies and start the frontend:

``` bash
cd frontend
npm install
npm run dev
```

Vite will print the local frontend URL in the terminal, typically
`http://localhost:5173`.

> Vite exposes variables prefixed with `VITE_` to browser code. Only put
> public configuration such as the API base URL in these variables. Keep
> secrets in the backend environment.

## Environment Variables

### Backend

  Variable           Purpose
  ------------------ -----------------------------------------------------
  `PORT`             Port used by the Express server; defaults to `5000`
  `NODE_ENV`         Runtime environment
  `MONGODB_URI`      MongoDB connection string
  `JWT_SECRET`       Secret used to sign and verify JWTs
  `GEMINI_API_KEY`   API key used for Gemini receipt extraction
  `FRONTEND_URL`     Allowed production frontend origin for CORS

### Frontend

  Variable         Purpose
  ---------------- -----------------------------
  `VITE_API_URL`   Base URL of the backend API

## API Overview

The backend exposes REST endpoints for authentication, expense
management, receipt scanning, monthly summaries, and health checks.

  ------------------------------------------------------------------------------------------
  Method                  Endpoint                                   Purpose
  ----------------------- ------------------------------------------ -----------------------
  `POST`                  `/api/auth/register`                       Register a user

  `POST`                  `/api/auth/login`                          Log in

  `POST`                  `/api/auth/logout`                         Log out response

  `POST`                  `/api/expenses`                            Create an expense

  `GET`                   `/api/expenses`                            List the authenticated
                                                                     user's expenses

  `PUT`                   `/api/expenses/:id`                        Update an expense

  `DELETE`                `/api/expenses/:id`                        Delete an expense

  `POST`                  `/api/expenses/scan-receipt`               Extract expense details
                                                                     from a receipt image

  `GET`                   `/api/summary/monthly?year=YYYY&month=M`   Get a monthly spending
                                                                     summary

  `GET`                   `/api/health`                              Check backend health
  ------------------------------------------------------------------------------------------

The health route is public. Routes that access personal expense data
require a valid access token. Check the current backend route files for
the definitive API contract.

## Production Deployment

-   **Frontend:** Deploy the `frontend` application to Vercel and
    configure `VITE_API_URL` to point to the deployed backend.
-   **Backend:** Deploy the `backend` application to Render and
    configure the backend environment variables in the service
    dashboard.
-   **Database:** Use MongoDB Atlas and ensure the deployed backend is
    permitted to connect.
-   **CORS:** Configure the backend to allow the exact deployed frontend
    origin.

Never put `MONGODB_URI`, `JWT_SECRET`, or `GEMINI_API_KEY` in frontend
code or commit them to source control.

## Possible Improvements

-   Add automated unit and integration tests.
-   Add pagination and filtering for large expense histories.
-   Add export options for expense reports.
-   Add monitoring and more detailed error reporting.
-   Add budget targets and configurable spending alerts.

## Contributing

1.  Fork the repository.
2.  Create a feature branch.
3.  Make and test your changes.
4.  Open a pull request describing the change.

## License

No license has been specified yet. Add a `LICENSE` file if you intend to
publish the project under an open-source license.
