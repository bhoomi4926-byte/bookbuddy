# BookBuddy — Practical 6: RESTful API

A REST API for BookBuddy book records, built with Node.js, Express.js, MongoDB Atlas, and Mongoose. It preserves the book fields used by Practical 5 (`title`, `author`, `genre`, `language`, `description`, `image`, and `reviews`) while moving storage from a JSON file to a database.

## Requirements

- Node.js (LTS recommended)
- MongoDB Atlas database, or a local MongoDB instance
- Postman for endpoint testing

## Setup

1. Open a terminal in this folder.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to a new file named `.env`.
4. Put your MongoDB connection string in `.env`:

   ```env
   PORT=3000
   MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@YOUR-CLUSTER/bookbuddy?retryWrites=true&w=majority
   ```

   Replace the example values with your real Atlas credentials. Never commit `.env` to GitHub.

5. Start the API:

   ```bash
   npm start
   ```

6. Open `http://localhost:3000/` to see the API information, or `http://localhost:3000/health` to check server/database status.

## Book fields and validation

- `title`: required, 2–100 characters
- `author`: required, 2–80 characters
- `genre`: one of `Fiction`, `Mystery`, `Fantasy`, `Romance`, `Biography`, `Non-fiction`, `Drama`
- `language`: one of `English`, `Hindi`, `Marathi`
- `description`: required, 20–800 characters
- `image`: optional HTTP/HTTPS URL; a default image is used when omitted
- `reviews`: array of review subdocuments (created empty for new books)

## API endpoints

| Method | Endpoint | Purpose | Success status |
|---|---|---|---|
| GET | `/api/books` | Read all books | 200 |
| GET | `/api/books/:id` | Read one book by MongoDB ID | 200 |
| POST | `/api/books` | Create a book | 201 |
| PUT | `/api/books/:id` | Replace/update the book fields | 200 |
| DELETE | `/api/books/:id` | Delete a book | 200 |
| GET | `/health` | Check server and database status | 200 |

### POST /api/books sample JSON

Choose `POST`, set `Body` → `raw` → `JSON` in Postman, and send:

```json
{
  "title": "Atomic Habits",
  "author": "James Clear",
  "genre": "Non-fiction",
  "language": "English",
  "description": "A practical guide to building better habits and improving everyday routines.",
  "image": "https://example.com/atomic-habits.jpg"
}
```

Copy the `_id` returned by MongoDB for GET, PUT, and DELETE tests.

### PUT /api/books/:id sample JSON

PUT expects the required book fields:

```json
{
  "title": "Atomic Habits",
  "author": "James Clear",
  "genre": "Non-fiction",
  "language": "English",
  "description": "An updated review describing how small routines can lead to lasting improvements.",
  "image": "https://example.com/atomic-habits.jpg"
}
```

## Postman testing checklist

1. `GET http://localhost:3000/` — API information.
2. `GET http://localhost:3000/health` — database should say `connected`.
3. `POST http://localhost:3000/api/books` — create a valid book; expect `201`.
4. `GET http://localhost:3000/api/books` — expect `200` and the new record.
5. `GET http://localhost:3000/api/books/<id>` — expect `200`.
6. `PUT http://localhost:3000/api/books/<id>` — update a record; expect `200`.
7. `DELETE http://localhost:3000/api/books/<id>` — delete a record; expect `200`.
8. Repeat GET using the deleted ID — expect `404`.
9. Send an invalid POST (for example, title `A`) — expect `400` and validation errors.
10. Use a malformed ID such as `/api/books/not-an-id` — expect `400`.

## Deploying to Render

1. Push this folder to GitHub as `Practical_6/BookBuddy_Practical6_REST_API`.
2. In Render, create a **Web Service** and connect the repository.
3. Set **Root Directory** to `Practical_6/BookBuddy_Practical6_REST_API`.
4. Set **Build Command** to `npm install` and **Start Command** to `npm start`.
5. Add `MONGODB_URI` under the service's Environment settings. Do not add `.env` to GitHub.
6. In MongoDB Atlas, configure a database user and allow network access from the host as appropriate. For a student demo, a temporary broad IP rule may work but is less secure; restrict access when possible.
7. Deploy, then test `https://YOUR-RENDER-SERVICE.onrender.com/health` and the CRUD endpoints with Postman.

## Notes

- A real MongoDB database is used; the API does not read/write Practical 5's `data/books.json`.
- Keep this practical separate from Practical 5.
- Never expose database credentials in screenshots or source control.
- Save screenshots of successful CRUD calls, invalid data responses, and tests against the deployed public URL.
