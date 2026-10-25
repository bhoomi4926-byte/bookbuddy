# BookBuddy Practical 7 — NoSQL with Node.js

This project demonstrates a web interface backed by a MongoDB Atlas NoSQL database using Node.js, Express, Mongoose, and EJS.

## Setup
1. Extract the ZIP and open this folder in VS Code.
2. Run `npm install`.
3. Copy `.env.example` to `.env`.
4. Replace the placeholder `MONGODB_URI` with your existing working MongoDB Atlas connection URI. Use the database name `bookbuddy_practical7` to keep this practical's data separate from Practical 6.
5. Keep `.env` private; do not upload it to GitHub.
6. Run `npm start` and open `http://localhost:3002`.

## Features
- Add and view books
- Edit and delete book records
- Save ratings, descriptions, and reviews
- Server-side validation through Mongoose
- JSON REST API endpoints

## API endpoints
- `GET /api/books` — list books
- `GET /api/books/:id` — retrieve one book
- `POST /api/books` — create a book
- `PUT /api/books/:id` — update a book
- `DELETE /api/books/:id` — delete a book
- `GET /health` — check API and database status

## Example POST JSON
{
  "title": "Wings of Fire",
  "author": "A. P. J. Abdul Kalam",
  "genre": "Biography",
  "language": "English",
  "rating": 5,
  "description": "An inspiring autobiography.",
  "review": "A motivating and memorable read."
}

## Render deployment
- Build command: `npm install`
- Start command: `npm start`
- Set `MONGODB_URI` in Render Environment Variables.
- Do not upload `.env` or `node_modules`.
