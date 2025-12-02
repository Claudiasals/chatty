import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// carica il file .env accanto a server.js
dotenv.config({ path: path.join(__dirname, ".env") });

console.log(process.env.GEMINI_API_KEY);

const app = express();
app.use(express.json());

// Servire i file statici
app.use(express.static(path.join(__dirname, "../client")));

// Route esplicita per la root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

// Endpoint proxy
app.post("/api/gemini", async (req, res) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      }
    );
    const data = await response.json();

    console.log("Risposta da Gemini:", data)
    
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nel server" });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log("Server avviato sulla porta", PORT));
