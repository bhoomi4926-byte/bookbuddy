// Practical 4: BookBuddy server-side validation using CORE NODE.JS (no Express).
const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const MAX_BODY_SIZE = 1024 * 1024;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function sendJSON(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

function readJSONBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (Buffer.byteLength(body, "utf8") > MAX_BODY_SIZE) {
        reject(new Error("Request body is too large."));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch (error) {
        reject(new Error("Request body must contain valid JSON."));
      }
    });
    req.on("error", reject);
  });
}

function validateBook(book) {
  const errors = {};
  const title = typeof book.title === "string" ? book.title.trim() : "";
  const author = typeof book.author === "string" ? book.author.trim() : "";
  const genre = typeof book.genre === "string" ? book.genre : "";
  const language = typeof book.language === "string" ? book.language : "";
  const image = typeof book.image === "string" ? book.image.trim() : "";
  const description = typeof book.description === "string" ? book.description.trim() : "";

  if (!title) errors.title = "Title is required.";
  else if (title.length < 2) errors.title = "Title must be at least 2 characters.";
  else if (title.length > 100) errors.title = "Title must not exceed 100 characters.";

  if (!author) errors.author = "Author is required.";
  else if (author.length > 100) errors.author = "Author must not exceed 100 characters.";

  if (!["Fiction", "Romance", "Mystery", "Fantasy", "Drama", "Non-fiction"].includes(genre)) {
    errors.genre = "Please choose a valid genre.";
  }

  if (!["English", "Hindi", "Marathi"].includes(language)) {
    errors.language = "Please choose a valid language.";
  }

  if (!image) {
    errors.image = "Cover image URL is required.";
  } else {
    try {
      const parsedURL = new URL(image);
      if (!["http:", "https:"].includes(parsedURL.protocol)) {
        errors.image = "Image URL must start with http:// or https://.";
      }
    } catch (error) {
      errors.image = "Enter a valid image URL starting with http:// or https://.";
    }
  }

  if (!description) errors.description = "Description is required.";
  else if (description.length < 20) errors.description = "Description should be at least 20 characters.";
  else if (description.length > 1000) errors.description = "Description must not exceed 1000 characters.";

  return errors;
}

function validateReview(review) {
  const errors = {};
  const rating = Number(review.rating);
  const text = typeof review.text === "string" ? review.text.trim() : "";
  const bookId = Number(review.bookId);

  if (!Number.isInteger(bookId) || bookId <= 0) {
    errors.text = "A valid book must be selected before submitting a review.";
  }

  if (review.rating === "" || review.rating === undefined ||
      !Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.rating = "Rating must be a whole number from 1 to 5.";
  }

  if (!text) errors.text = "Review text is required.";
  else if (text.length < 5) errors.text = "Review must be at least 5 characters.";
  else if (text.length > 500) errors.text = "Review must not exceed 500 characters.";

  return errors;
}

async function handleAPI(req, res, pathname) {
  if (req.method === "GET" && pathname === "/api/health") {
    return sendJSON(res, 200, {
      success: true,
      message: "BookBuddy Node.js server is running."
    });
  }

  if (req.method === "POST" && (pathname === "/api/books" || pathname === "/api/reviews")) {
    let data;
    try {
      data = await readJSONBody(req);
    } catch (error) {
      return sendJSON(res, 400, {
        success: false,
        message: error.message || "Invalid request body."
      });
    }

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return sendJSON(res, 400, {
        success: false,
        message: "Request body must be a JSON object."
      });
    }

    if (pathname === "/api/books") {
      const errors = validateBook(data);
      if (Object.keys(errors).length > 0) {
        return sendJSON(res, 400, {
          success: false,
          message: "Book validation failed. Please correct the highlighted fields.",
          errors
        });
      }

      return sendJSON(res, 201, {
        success: true,
        message: "Book details passed server-side validation."
      });
    }

    const errors = validateReview(data);
    if (Object.keys(errors).length > 0) {
      return sendJSON(res, 400, {
        success: false,
        message: "Review validation failed. Please correct the highlighted fields.",
        errors
      });
    }

    return sendJSON(res, 201, {
      success: true,
      message: "Review passed server-side validation."
    });
  }

  if (pathname.startsWith("/api/")) {
    return sendJSON(res, 404, {
      success: false,
      message: "API route not found."
    });
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, {
      "Content-Type": "text/plain; charset=utf-8",
      "Allow": "GET, HEAD, POST"
    });
    return res.end("Method Not Allowed");
  }

  // Serve the existing React app and its CSS with the core fs/path modules.
  let requestedPath = pathname === "/" ? "/index.html" : decodeURIComponent(pathname);
  const filePath = path.resolve(PUBLIC_DIR, "." + requestedPath);

  if (!filePath.startsWith(PUBLIC_DIR + path.sep) && filePath !== path.join(PUBLIC_DIR, "index.html")) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Forbidden");
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(error.code === "ENOENT" ? 404 : 500, {
        "Content-Type": "text/plain; charset=utf-8"
      });
      return res.end(error.code === "ENOENT" ? "Page not found" : "Internal server error");
    }

    const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": contentType,
      "X-Content-Type-Options": "nosniff"
    });
    if (req.method === "HEAD") return res.end();
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  let parsedURL;
  try {
    parsedURL = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  } catch (error) {
    return sendJSON(res, 400, { success: false, message: "Invalid URL." });
  }

  handleAPI(req, res, parsedURL.pathname).catch((error) => {
    console.error("Request handling error:", error);
    if (!res.headersSent) {
      sendJSON(res, 500, { success: false, message: "Unexpected server error." });
    } else {
      res.end();
    }
  });
});

server.listen(PORT, () => {
  console.log(`BookBuddy Practical 4 server running at http://localhost:${PORT}`);
  console.log("Using core Node.js modules only — Express.js is not used.");
});
