import './App.css';
import context, { bot_answer } from './Bot.js';
import doctoLogo from "./images/Doctolib_logo.png"
//import fileics from "./event.ics"
import React, { useRef, useState } from 'react';


/* Initialize the messages array with the welcoming message and the first choice" */
var messages = [{
  text: ["Bienvenue sur le Chat Bot Doctolib"],
  whom: "sent"
}, {
  text: ["Voulez-vous:"],
  whom: "sent"
}, {
  text: ["- 1. Exporter votre calendrier de rendez-vous sous le format .ics ?"],
  whom: "sent"
}, {
  text: ["- 2. Chercher quel practicien vous devriez consulter selon vos symptômes ?"],
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
      text: [formValue],
      whom: "received"
    });
    
    /* Push la réponse du bot dans l'array de messages */
    messages.push({
      text: bot_answer(formValue),
      whom: "sent"
    })

    /* Si on a renvoyé une profession alors on s'occupe de la fin de l'interaction */
    if (context.mode === "done")
    messages.push({
      text: ["Voulez-vous effectuer la recherche de rendez-vous directement via le chatbot ?", "oui/non"],
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
  const { text } = props.message
  const { whom } = props.message
  const img = whom === "sent" ? 'user.png' : 'user.png';
  const imgClass = whom === "sent" ? 'botpic' : 'userpic'

  return (<>
    <div className={`message ${whom}`}>
      <img class={imgClass} src={img} />
      <p><PrettyPrint text={text}/></p>
    </div>
  </>)
}

function PrettyPrint(text) {
  var temp = text.text
  if (temp.length == 0)
    return(<></>)
  if (temp.length == 1)
    return (<>
      {temp[0]}
    </>)
  if (context.mode === "link") {
    console.log(temp[1])
    if (temp.length > 2) {
      if (temp[1].includes("doctolib")){
        return <>
          {temp[0]}
          <br/>
          <a href={temp[1]}>{temp[1]}</a> 
          <br/>
          <br/>
          {temp[2]}
        </>
      }
    }
  }
  return(<>
    {temp[0]} <br/> <PrettyPrint text={temp.slice(1)} />
  </>)
}

export default App;
