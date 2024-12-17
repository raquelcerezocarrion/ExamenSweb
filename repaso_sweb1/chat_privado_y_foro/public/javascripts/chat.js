const socket = io();
const form = document.getElementById("form-chat");
const input = document.getElementById("input");
const messages = document.getElementById("messages");
const userSearch = document.getElementById("username"); // Campo para buscar usuarios (chat privado)
const startChat = document.getElementById("start-chat"); // Botón para iniciar chat privado
const chatContainer = document.getElementById("chat-container"); // Contenedor del chat
const forumMessages = document.getElementById("forum-messages"); // Contenedor de mensajes del foro
const privateMessages = document.getElementById("private-messages"); // Contenedor de mensajes privados
let currentRoom = null; // Sala actual en chat privado

const username = chatContainer ? chatContainer.getAttribute("data-username") : null; // Usuario logueado

// === Manejo del Foro ===
if (forumMessages) {
  // Unirse al foro
  socket.emit('joinForum');

  // Cargar mensajes previos del foro
  socket.on('loadForumMessages', (messages) => {
    forumMessages.innerHTML = ''; // Limpiar mensajes existentes
    messages.forEach((msg) => {
      const item = document.createElement("li");
      item.textContent = `${msg.username}: ${msg.message}`;
      if (msg.username === username) {
        item.classList.add("current-user-message");
      } else {
        item.classList.add("other-user-message");
      }
      forumMessages.appendChild(item);
    });
  });

  // Mostrar mensajes del foro en tiempo real
  socket.on('forumChat', (data) => {
    const item = document.createElement("li");
    item.textContent = `${data.username}: ${data.message}`;
    if (data.username === username) {
      item.classList.add("current-user-message");
    } else {
      item.classList.add("other-user-message");
    }
    forumMessages.appendChild(item);
    forumMessages.scrollTop = forumMessages.scrollHeight; // Desplazar al último mensaje
  });
}

// === Manejo del Chat Privado ===
if (startChat) {
  // Iniciar un chat privado
  startChat.addEventListener('click', () => {
    const otherUser = userSearch.value.trim(); // Obtener el nombre del usuario
    if (otherUser) {
      currentRoom = [username, otherUser].sort().join('_'); // Crear ID único para la sala
      socket.emit('joinPrivateRoom', { from: username, to: otherUser }); // Emitir evento al servidor
      privateMessages.innerHTML = ''; // Limpiar mensajes existentes
      console.log(`Chat iniciado con ${otherUser} en la sala ${currentRoom}`);
    } else {
      alert('Por favor, introduce un nombre de usuario válido.');
    }
  });

  // Cargar mensajes previos del chat privado
  socket.on('loadPrivateMessages', (messages) => {
    privateMessages.innerHTML = ''; // Limpiar mensajes existentes
    messages.forEach((msg) => {
      const item = document.createElement("li");
      item.textContent = `${msg.username}: ${msg.message}`;
      if (msg.username === username) {
        item.classList.add("current-user-message");
      } else {
        item.classList.add("other-user-message");
      }
      privateMessages.appendChild(item);
    });
  });

  // Mostrar mensajes privados en tiempo real
  socket.on('privateChat', (data) => {
    if (currentRoom) {
      const item = document.createElement("li");
      item.textContent = `${data.username}: ${data.message}`;
      if (data.username === username) {
        item.classList.add("current-user-message");
      } else {
        item.classList.add("other-user-message");
      }
      privateMessages.appendChild(item);
      privateMessages.scrollTop = privateMessages.scrollHeight; // Desplazar al último mensaje
    }
  });
}

// Enviar mensaje (foro o privado)
form.addEventListener('submit', function (e) {
  e.preventDefault();
  if (input.value) {
    if (currentRoom) {
      // Enviar mensaje al chat privado
      socket.emit('privateChat', { room: currentRoom, message: input.value, username });
    } else {
      // Enviar mensaje al foro
      socket.emit('chat', { message: input.value, username });
    }
    input.value = ''; // Limpiar el campo de entrada
  }
});
