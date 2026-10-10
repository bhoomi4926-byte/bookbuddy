# BookBuddy — Practical 5 (Express.js)

A multi-page book discovery and review website demonstrating Express.js routes, request/response handling, server-side validation, success/error messages, and JSON file storage.

## Pages
- `/` — Home
- `/books` — Explore/search/filter books
- `/books/new` — Add a book (POST `/books`)
- `/reviews/new` — Submit a review (POST `/reviews`)
- `/books/:id` — Book details and reviews

## Run locally
1. Install Node.js (LTS).
2. Open a terminal in this folder.
3. Run `npm install`.
4. Run `npm start`.
5. Open `http://localhost:3000`.

## Server-side validation
- Book title: 2–100 characters.
- Author: 2–80 characters.
- Genre and language must be selected from allowed values.
- Description: 20–800 characters.
- Optional image URL must be a valid HTTP/HTTPS URL.
- Review must reference an existing book, name must be 2–50 characters, rating must be an integer from 1 to 5, and review text must be 5–500 characters.
- Invalid forms return HTTP 400 and display specific error messages. Successful submissions are saved in `data/books.json` and redirected with a success message.

## Routes
| Method | Route | Purpose |
|---|---|---|
| GET | `/` | Home page |
| GET | `/books` | Browse/search/filter books |
| GET | `/books/new` | Display add-book form |
| POST | `/books` | Validate and save book |
| GET | `/reviews/new` | Display review form |
| POST | `/reviews` | Validate and save review |
| GET | `/books/:id` | Show book details |

## Deployment note
Deploy as a Node.js web service on a platform that supports Express. Configure the service root to this project folder and the start command to `npm start`. A free host's local filesystem may be temporary, so use persistent storage if submitted JSON data must survive restarts/redeployments.
