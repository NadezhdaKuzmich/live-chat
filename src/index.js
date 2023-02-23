import io from 'socket.io-client';
import moment from 'moment';

const socket = io('http://localhost:3000');
const button = document.querySelector('.send');
const saveBtn = document.querySelector('.save');
const input = document.getElementById('input');
const chat = document.querySelector('.chat');
let userId, btnsEdit, btnsDelete;
let msgIndex = 0;

const username = window.prompt("Enter the username", 'anonymous');
socket.emit('new user', username);
socket.on('welcome', id => {
  userId = id;
})

input.addEventListener("keyup", function(event) {
  if (event.key === 'Enter') {
    if(!button.classList.contains('hide')) {
      button.click();
    } else {
      saveBtn.click();
    }
  }
});

button.addEventListener('click', newMessage);
function newMessage() {
  if(input.value.trim() === '') {
    return;
  }
  socket.emit('message', input.value);
  input.value = '';
}

socket.on('receiveMessage', (response) => {
  const isMessageFromUser = response.userId === userId;
  const chatContainer = document.createElement('div');
  chatContainer.classList.add('chatContainer');

  if(!isMessageFromUser){
    chatContainer.classList.add('left');
  } else {
    chatContainer.classList.add('right');
  }

  const message = document.createElement('div');
  message.setAttribute('index', msgIndex);
  message.classList.add('message');
  
  if(!isMessageFromUser) {
    message.classList.add('friend');
  } else {
    message.classList.add('user');
    message.classList.add('edit-box');
    message.insertAdjacentHTML("beforeend",
    `<div class="edit">
    <button class="edit-msg">&#9998;</button>
    <button class="delete-msg">&#10005;</button>
    </div>`);
  }

  const messageInfo = document.createElement('div');
  messageInfo.classList.add('message_box');

  const username = document.createElement('p');
  username.innerText = response.user;
  username.classList.add('username');

  const date = document.createElement('p');
  date.innerText = moment().format('DD.MM.YYYY h:mm');
  date.classList.add('date');

  const messageContainer = document.createElement('div');
  messageContainer.classList.add('message_container');

  const textParagraph = document.createElement('p');
  textParagraph.classList.add('text');
  textParagraph.innerText = response.message;

  chatContainer.appendChild(message);
  message.appendChild(messageInfo);
  messageInfo.appendChild(username);
  messageInfo.appendChild(date);
  message.appendChild(messageContainer);
  messageContainer.appendChild(textParagraph);
  const chatMessageContainer = document.getElementsByClassName('chat')[0];
  chatMessageContainer.appendChild(chatContainer);
  msgIndex++;
})

let dataEdit, dataDel;
chat.addEventListener('click', (event) => {
  btnsEdit = document.querySelectorAll('.edit-msg');
  btnsDelete = document.querySelectorAll('.delete-msg');

  btnsEdit.forEach(btn => {
    if(btn == event.target) {
      const message = btn.closest('.message').querySelector('.message_container').querySelector('p');
      dataEdit = btn.closest('.message').getAttribute('index');
      socket.emit('id message', dataEdit);
      input.value = message.textContent;
      input.focus();
      button.classList.add('hide');
      saveBtn.classList.remove('hide');
    }
  })

  btnsDelete.forEach(btn => {
    if(btn == event.target) {
      const message = btn.closest('.message');
      dataDel = btn.closest('.message').getAttribute('index');
      socket.emit('deleteMessage', dataDel);
      if(dataDel == dataEdit) {
        saveBtn.classList.add('hide');
        button.classList.remove('hide');
        input.value = '';  
      }
    }
  })
})

saveBtn.addEventListener('click', () => {
  if(input.value.trim() === '') {
    return;
  }
  socket.emit('editMessage', input.value);
  saveBtn.classList.add('hide');
  button.classList.remove('hide');
  input.value = '';
})      

socket.on('updateMessage', (response) => {
  const messages = document.querySelectorAll('.text');
  messages.forEach(msg => {
    if(msg.closest('.message').getAttribute('index') == response.messageId) {
      msg.textContent = response.newMessage;
      const messageBox = msg.closest('.message');
      messageBox.querySelector('.date').textContent = moment().format('DD.MM.YYYY h:mm');

      if(!messageBox.classList.contains('change-msg')) {
        messageBox.classList.add('change-msg');
        const mark = document.createElement('div');
        mark.classList.add('change');
        mark.insertAdjacentHTML("beforeend",`<span>Змінено</span>`);
        messageBox.appendChild(mark);  
      }
    }
  })
})

socket.on('removeMessage', (response) => {
  const messages = document.querySelectorAll('.message');
  messages.forEach(msg => {
    if(msg.getAttribute('index') == response.messageId) {
      msg.remove();
    }
  })
})