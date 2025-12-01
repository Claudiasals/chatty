import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Endpoint proxy
app.post("/api/gemini", async (req, res) => {
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/Text-Bison-001:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Errore nel server" });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log("Server avviato sulla porta", PORT));
