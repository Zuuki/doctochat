import React, { useRef, useState } from 'react';
import './App.css';

var userMessages = [];

function App() {
  return (
    <div className="App">
      <section>
        <ChatRoom />
      </section>
    </div>
  );
}

function ChatRoom() {
  const dummy = useRef();
  //var userMessages = [];
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

      <button type="submit" disabled={!formValue}>🕊️</button>

    </form>
  </>)
}

function ChatMessage(props) {
  const { text } = props.message;

  return (<>
    <div className={`message bot`}>
      <img src={'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
    </div>
  </>)
}

export default App;
