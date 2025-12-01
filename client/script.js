// @ PREPARAZIONIE

// Recupero gli elementi di interesse della pagina

const input = document.querySelector("input");
const button = document.querySelector("button");
const chatBox = document.querySelector(".chat-box");
const search = document.querySelector(".ph-duotone.ph-magnifying-glass")

// preparazione dei messaggi iniziali
const messages = [
];




// ? PREPARO L'ENDPOINT x l'AI: L'INDIRIZZO DA CHIAMARE PER L'API DI GEMINI
/* questo è l'endpoint della funionalità di gemini che ci interessa. 
post https://generativelanguage.googleapis.com/v1beta/{model=models/*}:generateContent

Gemini ci da però le indicazioni su come inserire l'endpoint: 
--> Parametri del percorso
model string
Obbligatorio. Il nome di Model da utilizzare per generare il completamento.
---> Formato: models/{model}. Assume la forma models/{model}.

poi integro la mia API KEY:
scrivendo alla fine del mio link "?key="" + il codice della key "AIzaSyCEWY1w4cLLLur8OKYYEZcNhdBGX3K5Qjg"
*/
const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyCEWY1w4cLLLur8OKYYEZcNhdBGX3K5Qjg"




// # PROMPT PER L'AI : istruzioni per l'ai su come deve rispondere.

const systemPrompt = "Sei Chatty, un'intelligenza artificiale parla in Italiano, risponde in modo breve e coinciso senza tergiversare. Mi corregge le bozze trovando i refusi, risponde alle mie domande e mi aiuta a studiare coding come un vero assistente virtuale.";




// @ OPERAZIONI DI AVVIO PAGINA 

// svuoto la chat

chatBox.innerHTML = "";

// Per ciascuno dei messaggi creami una variabiule messagge
showMessages();




// ? OPERAZIONI DI INTERAZIONE CON L'UTENTE

// al click del bottone invia il msg inserito nell'input dall'utente
button.addEventListener("click", function () {
    const insertedText = input.value; // prendo il testo inserito nell'input
    console.log(insertedText)

    // controllo che l'input non sia vuoto
    if (!insertedText) return; // se l’input è vuoto, la funzione si interrompe subito

    addMessage("sent", insertedText); /* metto sent come primo parametro perché 
    al click posso soltanto invare quindi posso già specificare "sent".
     */

    // svuuoto chat
    chatBox.innerHTML = "";

    // aggiungo il nuovo messaggio alla lista dei messaggi
    showMessages();

    // svuoto la casella input dopo aver inviato il messaggio
    input.value = ""
    // e riporto il cursore nell'input
    input.focus()

    // scorro in automatico alla fine del box per vedere gli ultimi msg al posto dei primi
    chatBox.scrollTop = chatBox.scrollHeight
    // gli stiamo dicendo scotti in lunghezza la barra quanto è alta la chatBox
});

// alla pressione del tasto "invio" sulla tastiera del pc invia il messaggio

input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") sendMessage()
    /* event.key ci dice che tasto stiamo schiacciando
 === enter significa che se il tasto che stiamo schiacciando 
 è enter allora eseguo la funzione "sendMessage"(invio msg)*/
});





// ? FUNZIONI UTILI

function showMessages() {
    // svuuoto chat
    chatBox.innerHTML = "";

    // aggiungo il nuovo messaggio alla lista dei messaggi
    for (const message of messages) {
        chatBox.innerHTML += `
       <div class="chat-row ${message.type}">
           <div class="chat-message">
               <p> ${message.text}</p>
               <time datetime="${message.time}">
               ${message.time}
               </time>
           </div>
       </div>`
    }

       // riporto il cursore nell'input
       input.focus()

       // scorro in automatico alla fine del box per vedere gli ultimi msg al posto dei primi
       chatBox.scrollTop = chatBox.scrollHeight

}

// fuunzione per aggiungere un messaggio 
function addMessage(messageType, messageText) {
    // creo un nuovo messaggio
    const newMessage = {
        type: messageType,
        text: messageText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        /* new Date().toLocaleTimeString  in automatico ci da data e ora, aggiungo l'oggetto perché voglio soltanto l'orario*/
    }
    // aggiungo msg alla lista messaggi
    messages.push(newMessage) // il nuovo oggetto viene aggiunto all'array come 3 oggetto.
    // mostro il msg in chat
    showMessages()
}


// funzione  per inviare un messaggio dall'input 
function sendMessage() {
    // recupero il testo inserito dall'utente
    const insertedText = input.value; // prendo il testo inserito nell'input
    console.log(insertedText)

    // controllo che l'input non sia vuoto
    if (!insertedText) return; // se l’input è vuoto, la funzione si interrompe subito

    // aggiungi il msg in pagina
    addMessage("sent", insertedText);
    /* metto sent come primo parametro perché 
    al click posso soltanto invare quindi posso già specificare "sent" */

    // svuoto la casella input dopo aver inviato il messaggio
    input.value = ""
 
    // gli stiamo dicendo scotti in lunghezza la barra quanto è alta la chatBox

    // chiedo a gemini di generare una risposta
    getAnswerFromGemini()
};





//? INTEGRO L'AI -----------------

// @FORMATTARE LA CHAT PER GEMINI
function formatChatForGemini() {
    // preparo un array per la "nuova chat" tra l'utete e gemini
    const formattedChat = [] // formattedChat è il nostro metodo 

    // Per ciascun msg contenuto nella mia lista di messaggi devo creare e aggiungere un nuovo oggetto alla 
    // mia chat formattata. con .push aggiungo temporaneamente elementi all'array della chat.
    for (const message of messages) {
        formattedChat.push({
            parts: [{
                text: message.text
                // recupero il messaggio che viene scritto
            }],
            // definiamo con l'operatore terniario il ruolo nel nuovo oggetto formattato per gemini:
            // se è "sent" nel modlelo originale del msg, allora il ruoo nel nuovo msg formattatto è user, senno è model.
            role: message.type === "sent" ? "user" : "model"
            // oppure:
            // role: message.type === "revcivded" ? "model" : "user"
        })
    }




    //# AGGIUNGO IL SYSTEM PROMPT ALL'INIZIO DELL'ARRAY 
    formattedChat.unshift({ // metodo degli array per aggiungere un elemento all'inizio dell'array
        role: "user",
        parts: [{ text: systemPrompt }]
    })

    return formattedChat


}

//# CHIEDIAMO ALL'AI DI GENERARE UNA RISPOSTA
async function getAnswerFromGemini() {
    // PREPARIAMO LA CHAT DA INVIARE 
    const chatForGemini = formatChatForGemini()

    // effettuiamo la chiamata all'API di Gemini
    const response = await fetch(endpoint, {
        method: "POST", // tipo di chiamata
        headers: { "Content-Type": "application/json" }, // info su tipo di contenuto e linguaggio
        body: JSON.stringify({ contents: chatForGemini }) // cosa deve rimandarci
    })

    //@ TRASFORMIAMO LA RISPOSTA DI GEMINI IN UNA STRINGA LEGGIBILE
    const data = await response.json();

    //@ RECUPERO IL TESTO DELLA RISPOSTA
    // facciamo console.log di response e cerchiamo la risposta di gemini in candidates che è un array quindi []
    // poi c'è una chiave "contents" quindi è un oggetto, allora si scrive .contents, poi vediamo parts che è un array quindi .parts[0],
    // w poi troviamo "text" col msg, .text 
    const answer = data.candidates[0].content.parts[0].text // così avremo la nostra stringa della risposta.

    // provo a verificare:
    console.log(answer)

    //@ METTO LA RISPOSTA DI GEMINI NEI MESSAGGI IN CHAT! UTILIZZANDO LA FUNZIONE PER 
    // AGGIUNGERE UN MESSAGGIO : ADDMESSAGE
    addMessage("received", answer) // richiamo la classe received della funzione e richiamo la risposta di gemini

}

