import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const db = new Database("filmflow.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL,
    title TEXT,
    rating INTEGER,
    genre TEXT,
    release_year INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/sessions", (req, res) => {
    const sessions = db.prepare("SELECT * FROM sessions ORDER BY date DESC").all();
    res.json(sessions);
  });

  app.post("/api/sessions", (req, res) => {
    const { date, duration_seconds, title, rating, genre, release_year } = req.body;
    const info = db.prepare(`
      INSERT INTO sessions (date, duration_seconds, title, rating, genre, release_year)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(date, duration_seconds, title ?? "Untitled", rating ?? 0, genre, release_year);
    
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/sessions/:id", (req, res) => {
    const { id } = req.params;
    const { date, duration_seconds, title, rating, genre, release_year } = req.body;
    db.prepare(`
      UPDATE sessions 
      SET date = ?, duration_seconds = ?, title = ?, rating = ?, genre = ?, release_year = ?
      WHERE id = ?
    `).run(date, duration_seconds, title ?? "Untitled", rating ?? 0, genre, release_year, id);
    res.json({ success: true });
  });

  app.delete("/api/sessions/:id", (req, res) => {
    db.prepare("DELETE FROM sessions WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
