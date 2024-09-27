const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
const { doc, setDoc } = require("firebase/firestore");

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const readline = require('readline'); // Add readline for reading from console

// Inicializa Firebase and Firestore
const firebaseApp = initializeApp({
  apiKey: "AIzaSyDaMfY6LefAJ0f-JY63bFk-UN-x3_e32qw",
  authDomain: "taller-urv.firebaseapp.com",
  projectId: "taller-urv",
  storageBucket: "taller-urv.appspot.com",
  messagingSenderId: "762377341091",
  appId: "1:762377341091:web:8714606681ad6192139716",
  measurementId: "G-LKQWVZ6731"
});

const db = getFirestore();

// Create an express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve the HTML page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Store device IDs for users
const deviceIds = new Map();

// Assign a unique device ID to each user on connection
io.on('connection', (socket) => {
  const uniqueDeviceId = Math.floor(Math.random() * 10000);
  deviceIds.set(socket.id, uniqueDeviceId);

  console.log(`A user with device ID ${uniqueDeviceId} connected`);

  // Listen for chat messages
  socket.on('chat message', (message) => {
    const deviceId = deviceIds.get(socket.id);
    console.log(`Device ID ${deviceId} sent a message: ${message}`);

    // Store the message in Firestore
    let messageId = "message" + new Date().toISOString();
    setDoc(doc(db, "messages", String(deviceId)), {
      [messageId]: message,
    }, { merge: true });
  
    // Broadcast the message to all connected clients
    io.emit('chat message', { deviceId, message });
  });

  // Listen for disconnections
  socket.on('disconnect', () => {
    const deviceId = deviceIds.get(socket.id);
    console.log(`A user with device ID ${deviceId} disconnected`);
    deviceIds.delete(socket.id);
  });
});

// Create a readline interface for reading from console
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to send a message from the server console
function sendMessageFromAdmin(message) {
    const deviceId = 'El Admin'; // Set the deviceId to "El Admin"
    console.log(`El Admin sent a message: ${message}`);
    io.emit('chat message', { deviceId, message });
  }
  

// Listen for server console input
rl.on('line', (input) => {
  sendMessageFromAdmin(input);
});

server.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
