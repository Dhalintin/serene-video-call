const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const {v4: uuidv4} = require('uuid')

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`)
})

app.get('/:id', (req, res) => {
    res.render('room', {roomId: req.params.id})
});



io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-connected', userId)


        socket.on('disconnect', ()=> {
            socket.broadcast.to(roomId).emit('user-disconnected', userId)
        })
    });

    
})
server.listen(3000);