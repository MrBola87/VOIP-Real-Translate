import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import translateText from './translate';

const socket = io('http://localhost:5000');

function App() {
  const [myMessage, setMyMessage] = useState('');
  const [translatedMessage, setTranslatedMessage] = useState('');
  const myVideo = useRef();
  const userVideo = useRef();
  const peerRef = useRef();
  const streamRef = useRef(); // Use a ref to store the stream

  useEffect(() => {
    // Initialize the media stream once
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      streamRef.current = stream; // Store the stream in the ref
      myVideo.current.srcObject = stream;
    }).catch(error => console.error('Error accessing media devices.', error));

    socket.on('user-joined', (userId) => {
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: streamRef.current, // Use the stream from the ref
        dataChannel: true, // Enable data channel for text messages
      });

      peer.on('signal', (signal) => {
        socket.emit('sending-signal', { userToSignal: userId, signal });
      });

      peer.on('stream', (userStream) => {
        userVideo.current.srcObject = userStream;
      });

      peer.on('data', async (data) => {
        const receivedMessage = data.toString();
        const translated = await translateText(receivedMessage, 'es', 'en'); // Example: translating from Spanish to English
        setTranslatedMessage(translated);
      });

      socket.on('returning-signal', (signal) => {
        peer.signal(signal);
      });

      peerRef.current = peer;
    });

    return () => {
      socket.off('user-joined');
      socket.off('returning-signal');
    };
  }, []); // Empty dependency array to run only once on mount

  const handleSendMessage = async () => {
    console.log("Sending message:", myMessage);
    const translated = await translateText(myMessage, 'en', 'es'); // Example: translating from English to Spanish
    console.log("Translated message:", translated);
    if (peerRef.current) {
      peerRef.current.send(translated);
      console.log("Message sent to peer:", translated);
    }
    setMyMessage(''); // Clear the input after sending
  };

  return (
    <div className="App">
      <h1>VOIP App</h1>
      <video playsInline muted ref={myVideo} autoPlay style={{ width: '300px' }} />
      <video playsInline ref={userVideo} autoPlay style={{ width: '300px' }} />
      <div>   
        <input
          type="text"
          value={myMessage}
          onChange={(e) => setMyMessage(e.target.value)}
          placeholder="Type your message"
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
      <p>Translated Message: {translatedMessage}</p>
    </div>
  );
}

export default App;
