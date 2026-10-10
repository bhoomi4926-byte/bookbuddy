# BookBuddy — Practical 4 (Core Node.js, No Express)

## Aim
Extend the BookBuddy React application to demonstrate server-side validation, GET/POST handling, routing, and request/response processing using core Node.js modules only.

## Important
This project does **not** use Express.js or any npm dependency. It uses Node.js built-in modules: `http`, `fs`, `path`, and `url`.

## Run on Windows
1. Extract the ZIP file.
2. Open the extracted `BookBuddy_Practical4_NodeJS` folder in VS Code.
3. Open Terminal → New Terminal.
4. Check Node.js is installed:
   ```bash
   node -v
   ```
5. Start the server:
   ```bash
   npm start
   ```
   or:
   ```bash
   node server.js
   ```
6. Open `http://localhost:3000`.

Do not open `public/index.html` directly as a file. Open the localhost URL so the frontend can call the Node.js APIs.

## Routes
- `GET /` — serves the BookBuddy React interface.
- `GET /style.css` — serves the existing stylesheet.
- `GET /api/health` — confirms that the server is running.
- `POST /api/books` — validates the new book fields.
- `POST /api/reviews` — validates review rating and text.
- Unknown API routes return HTTP 404.
- Unsupported methods return HTTP 405.

## Server-side validation rules
### Add a book
- Title: required, 2–100 characters.
- Author: required, maximum 100 characters.
- Genre: must be one of Fiction, Romance, Mystery, Fantasy, Drama, Non-fiction.
- Language: must be English, Hindi, or Marathi.
- Cover image: valid `http://` or `https://` URL.
- Description: required, 20–1000 characters.

### Review a book
- Book ID: positive integer.
- Rating: integer from 1 to 5.
- Review text: required, 5–500 characters.

Validation occurs in `server.js`; browser-side checks alone are not relied on. Invalid requests receive HTTP 400 and field-specific errors. Valid submissions receive HTTP 201. The frontend displays the result and updates its existing localStorage state after the server accepts the submission.

## Test cases
1. Add a book with all valid fields → accepted by server and displayed in the shelf.
2. Submit a book with empty title → HTTP 400, title error.
3. Submit a book with invalid image URL → HTTP 400, image error.
4. Submit a book with description shorter than 20 characters → HTTP 400, description error.
5. Submit review rating `5` and review text `Very good book` → accepted.
6. Submit rating `8` → HTTP 400, rating error.
7. Submit review text `bad` → HTTP 400, review length error.
8. Open `http://localhost:3000/api/health` → JSON success response.

To directly test invalid server input, use browser developer tools, Postman, or curl. Example in a terminal:
```bash
curl -X POST http://localhost:3000/api/reviews -H "Content-Type: application/json" -d "{\"bookId\":1,\"rating\":8,\"text\":\"bad\"}"
```
Expected: HTTP 400 with validation errors.

## Deployment note
GitHub Pages hosts static files only and cannot run `server.js`. To deploy the complete Practical 4 application, use a Node.js-capable host. This project uses `process.env.PORT` for the assigned hosting port. Because the browser calls same-origin `/api/...` routes, deploy the `public` folder and `server.js` together on the same Node.js service.

## Viva points
- `http.createServer()` creates the HTTP server.
- `req.method` identifies GET/POST.
- `URL` parses the request URL and pathname.
- `req.on('data')` and `req.on('end')` read the POST request body.
- `fs.readFile()` serves frontend files.
- `path` safely constructs filesystem paths.
- `res.writeHead()` sends status codes and headers.
- `res.end()` completes the response.
- HTTP 201 means the request was successfully processed; HTTP 400 indicates invalid input.
