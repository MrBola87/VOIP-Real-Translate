const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure CORS to allow requests from your React app's URL
app.use(cors({
  origin: "http://10.2.0.2:3000", // Replace with your React app's IP and port
  methods: ["GET", "POST"],
  credentials: true
}));

// Serve a basic message at the root URL
app.get('/', (req, res) => {
  res.send('VOIP App Server Running');
});

// Configure socket.io with CORS settings
const io = socketIo(server, {
  cors: {
    origin: "http://10.2.0.2:3000", // Replace with your React app's IP and port
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

// Socket.io connection and communication handlers
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle a user joining
  socket.on('sending-signal', (payload) => {
    io.to(payload.userToSignal).emit('user-joined', payload.signal);
  });

  // Handle returning signal
  socket.on('returning-signal', (payload) => {
    io.to(payload.callerId).emit('returning-signal', payload.signal);
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start the server and listen on port 5000
server.listen(5000, () => {
  console.log('Server is running on http://localhost:5000');
});
