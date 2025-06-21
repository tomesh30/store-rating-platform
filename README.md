# store-rating-platform

# Store Rating Platform

This is a full-stack web application built for the FullStack Application. It allows users to register, log in, and rate stores based on a role-based access system. There are three types of users: System Administrator, Normal User, and Store Owner, each with their own functionalities.

---

## Project Structure

store-rating-platform/
├── client/ # React + Vite Frontend
├── server/ # Express Backend with MySQL
├── db/ # SQL schema and seed data
├── README.md
├── .gitignore


---

## Tech Stack

### Frontend
- React.js (18.3.1)
- Vite (5.4.2)
- TailwindCSS (3.4.1)
- React Router (6.20.1)
- TypeScript
- Lucide React Icons

### Backend
- Express.js (4.18.2)
- MySQL2 (3.6.0)
- JWT Authentication
- Bcrypt for password hashing
- Helmet and CORS for security
- Express Validator for input validation

---

## Features by User Role

### System Administrator
- Add new stores and users (admin/normal/store-owner)
- View total users, total stores, total ratings
- View and filter list of users and stores (by name, email, address, role)
- View user details including role and rating if the user is a Store Owner

### Normal User
- Sign up and log in
- Update password
- View all stores and search by name/address
- View and submit ratings (1–5) for stores
- Update own submitted rating

### Store Owner
- Log in and update password
- View users who submitted ratings for their store
- View average rating of their store

---

## Validation Rules

- **Name**: Minimum 20 characters, Maximum 60 characters
- **Email**: Must be a valid format
- **Password**: 8–16 characters, at least one uppercase letter and one special character
- **Address**: Maximum 400 characters

---

## Environment Variables

A `.env.example` file is included in the server directory to show required variables:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=store_rating
JWT_SECRET=your_jwt_secret
PORT=5000

---

## Database

- SQL schema and sample seed data are available in the `db/` folder.
- A migration script is included for initializing tables.

---

## Table Sorting & Filtering

- Admin dashboards support sorting by fields such as name, email, and role.
- Filtering is supported for users and stores by name, email, address, and role.

---

## Folder Highlights

### `/client/src`
- `pages/` — Role-specific pages
- `components/` — UI components like forms, tables, headers
- `services/` — API interaction using fetch or axios

### `/server`
- `controllers/` — Business logic
- `routes/` — Role-specific routes
- `middleware/` — Auth and role verification
- `models/` — DB models using raw SQL/MySQL2

---

## Notes

- JWT-based authentication implemented across the app.
- Passwords are securely hashed using bcrypt before storage.
- Form validations implemented on both frontend and backend.
- Clean, modular, and scalable codebase is followed.

---
