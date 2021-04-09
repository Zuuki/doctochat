import React, { useRef, useState } from 'react';
import './App.css';

var userMessages = [];

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

    await userMessages.push({
      text: formValue
    })
    
    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>

      {userMessages && userMessages.map(msg => <ChatMessage message={msg} />)}

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

  return (<>
    <div className={`message sent`}>
      <p>{text}</p>
    </div>
  </>)
}

export default App;
