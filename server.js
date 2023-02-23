import express from "express";
import { Server } from "socket.io";

const PORT = 3000
const app = express();
const options = {
  cors: true,
  origin: ['http://localhost:3000']
}
const server = app.listen(PORT, () => {
  console.log('server is started')
})
const io = new Server(server, options);
app.use(express.static('./dist'));
app.get('/', (req, res) => {
  res.sendFile("index.html");
})

io.on("connection", socket => {
  socket.emit('welcome', socket.id);
  socket.join('room1');

  socket.on('disconnect', () => {
    console.log('User disconnected - Username: ' + socket.username);
  });

  socket.on('new user', (usr) => {
    socket.username = usr;
    console.log('User connected - Username: ' + socket.username);
  });

  socket.on('message', message => {
    io.to("room1").emit('receiveMessage', {
      userId: socket.id,
      message: message, 
      user: socket.username,
    })
  })

  socket.on('id message', (msgId) => {
    socket.messageId = msgId;
  });

  socket.on('editMessage', message => {
    socket.newMessage = message;
    io.to('room1').emit('updateMessage', {
      newMessage: socket.newMessage,
      messageId: socket.messageId,
    })
  })

  socket.on('deleteMessage', messageId => {
    socket.messageIdDel = messageId; 
    io.to('room1').emit('removeMessage', {
      messageId: socket.messageIdDel,
    });
  })
})