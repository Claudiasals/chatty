import express from "express";
// Express è un framework Node.js che ci permette di creare server web facilmente
// Senza Express dovremmo usare solo 'http' di Node, che è più complesso

import fetch from "node-fetch";
// fetch ci permette di fare richieste HTTP verso API esterne,
// come nel nostro caso l'API Gemini di Google

import dotenv from "dotenv";
// dotenv serve a leggere le variabili d'ambiente da un file .env
// In questo modo non mettiamo mai la chiave API direttamente nel codice


// correzione per gestire i path con ES modules
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../client")));




dotenv.config();
// Legge il file .env e mette le variabili in process.env
// Ad esempio process.env.GEMINI_API_KEY conterrà la chiave API di Gemini


const app = express();
// Creiamo un'applicazione Express, cioè il nostro server


// ======================================================
// SERVIRE I FILE STATICI
// ======================================================
app.use(express.static("../client"));
/*
Questo dice a Express di servire i file statici (HTML, CSS, JS, immagini)
dalla cartella ../client rispetto a dove si trova server.js
Così se apriamo il browser e scriviamo [http://localhost:3000/](http://localhost:3000/)
vedremo index.html automaticamente.
*/



// ======================================================
// ENDPOINT PROXY PER GEMINI
// ======================================================
app.post("/api/gemini", async (req, res) => {
/*
Questo è un "proxy endpoint": il front-end non chiama direttamente Gemini,
perché non vogliamo esporre la chiave API al browser.
Invece invia la richiesta qui, e il server la inoltra a Gemini.
*/

try {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(req.body),
        }
      );
      

const data = await response.json(); 
// Convertiamo la risposta dell'API in oggetto JSON

res.json(data); 
// Rispondiamo al front-end con i dati che abbiamo ricevuto da Gemini


} catch (err) {
res.status(500).json({ error: "Errore nel server" });
// Se qualcosa va storto, restituiamo un errore generico 500
}
});

// ======================================================
// AVVIO DEL SERVER
// ======================================================
const PORT = 3000;
// Porta su cui il server ascolterà le richieste

app.listen(PORT, () => console.log("Server avviato sulla porta", PORT));
// Avvia il server e stampa in console che è pronto
// Ora il front-end può accedere a [http://localhost:3000/](http://localhost:3000/)
// e inviare richieste POST a /api/gemini
