const express = require('express');
const http = require('http');
const { Server } = require('socket.io'); // Importing Server from 'socket.io'
const { v4: uuidv4 } = require('uuid');
const { ExpressPeerServer } = require('peer');

// Initialize Express and HTTP server
const app = express();
const server = http.createServer(app);
const io = new Server(server); // Initialize Socket.io with the server

// Set up EJS and static file serving
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Redirect to a unique room ID
app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

// Render the room page
app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });
});

// Handle Socket.io connections
io.on('connection', (socket) => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);

        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnect', userId);
        });
    });
});

// Set up PeerJS server
const peerServer = ExpressPeerServer(server, {
    debug: true,
});
app.use('/peerjs', peerServer);

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
