import React, { useRef, useState } from 'react';
import './App.css';
import { bot_answer, start } from './Bot.js';

var messages = [];

function App() {
  return (
    <div className="App">
      <header>
        <h1> Docto ChatBot </h1>
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

    await messages.push({
      text: formValue,
      whom: "received"
    })

    /* TODO: Changer par la fonction qui va faire que le chat bot réponde */
    
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

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />

      <button type="submit" disabled={!formValue}>sedundnes</button>

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
