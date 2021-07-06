import './App.css';
import { bot_answer } from './Bot.js';
import doctoLogo from "./images/Doctolib_logo.png"
import React, { useRef, useState } from 'react';


/* Initialize the messages array with the welcoming message and the first choice" */
var messages = [{
  text: "Bienvenue sur le Chat Bot Doctolib",
  whom: "sent"
}, {
  text: "Voulez-vous:",
  whom: "sent"
}, {
  text: "- 1. Exporter votre calendrier de rendez-vous sous le format .ics ?",
  whom: "sent"
}, {
  text: "- 2. Chercher quel practicien vous devriez consulter selon vos symptômes ?",
  whom: "sent"
}];

function App() {
  return (
    <div className="App">
      <header>
        <img className="logo_doctolib" src={doctoLogo} alt="Logo Doctolib"></img>
        <h1> Chat Bot </h1>
      </header>

      <section>
        <ChatRoom />
      </section>
    
    </div>
  );
}

function ChatRoom() {

  const dummy = useRef();

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    /* Attends un message de l'utilisateur et push le message dans l'array de messages */
    await messages.push({
      text: formValue,
      whom: "received"
    });
    
    /* Push la réponse du bot dans l'array de messages */
    messages.push({
      text: bot_answer(formValue),
      whom: "sent"
    })

    /* Reset le champ d'entrée de texte à sa valeur par défaut */
    setFormValue('');

    /* Scroll automatiquement au bas de la page quand un message est envoyé */
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Ecrivez ici" />

      <button type="submit" disabled={!formValue}> 🕊️ </button>

    </form>
  </>)
}

function ChatMessage(props) {
  const { text } = props.message;
  const { whom } = props.message;

  return (<>
    <div className={`message ${whom}`}> 
      <p>{text}</p>
    </div>
  </>)
}

export default App;
