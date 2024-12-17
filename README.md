# Contenido:

1. [ChatMuySimple](#caso-chat-sin-registro) - Foro sin necesidad de registrarse
2. [ChatForoLogin](#caso-foro) - Chat entre varios usuarios con registro previo
4. [Login y Registro](#caso-login-y-registro-con-users) - Rutas y vistas para llevar a cabo el registro e inicio de sesión dado un archivo users.js
5. [Login y Registro con Database](#caso-login-con-database) -  Rutas y vistas para llevar a cabo el registro e inicio de sesión dado el directorio database/ con user.model.js
6. [Ejercicio title en un solo sitio](#caso-title) - Introducir el título del servidor en un único sitio en app.js
7. [Ejercicio .env](#casos-env) - Datos del servidor se introducen en un archivo .env
8. [Ejercicio scripts](#caso-scripts) - Configuración de scripts para su implementación en un proyecto.
9. [Ejercicio Ruta Admin](#caso-admin) - Ruta solo para usuarios con rol administrador.
10. [Ejercicio de Cookies](#casos-cookies) - Despliegue de una pestaña para la aceptación de cookies en el footer en index donde si se rechazan redirige a google y si se aceptan no se vuelven a solicitar en la sesión.
11. [Ejercicio Carritos](#caso-carrito-2-formas) - Implementación de funcionalidad del carrito en una tienda online
12. [Ejercicio Perfil y Derivados](#caso-ruta-perfil) - Ruta perfil añadida a una tienda
13. [ChatPrivado](#caso-chat-privado) : Chats privados y foro y hace falta registro

[ANEXO](#anexo) : Tiene códigos de ejemplo completos de app.js, header  y footer

## ATENCIÓN !!!!
### Cosas a tener en cuenta en app.js

1. Para que se apliquen las rutas en nodejs, se deberán declarar en el archivo app.js de la siguiente manera. Por ejemplo para la ruta /registro: PARA VER UN EJEMPLO COMPLETO DE APP.JS -> VER ANEXO

```javascript

let registroRouter = require('./routes/registro');
// Suele haber espacio entre medias
app.use('/registro', registroRouter);
 ```

2. En el caso en el cual no de la funcion de session en app.js, se debe introducir de la siguiente manera:

  a) En primer lugar se implementa el módulo si no está dado:
  ```javascript
  const session = require('express-session');
  ```
  b) En segundo lugar se implementa la siguiente lógica:
  ```javascript
  app.use(express.static(path.join(__dirname, 'public'))); /* Esto está. Poner lo de abajo a continuación */
  app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'El secreto que queramos nosotros'
  }));
  ```
3. En el caso en el que queramos desarrollar rutas restringidas a usuarios no logeados, se usará esta función en app.js (puede darla) e incluirla en el uso de las rutas:

  a) Función restricted en app.js:
  ```javascript
  function restricted(req, res, next){
    if(req.session.user){
      next();
    } else {
      res.redirect("login");
    }
  }
  ```
  b) Implementarlo en las rutas:
  ```javascript
  // Ejemplo de uso
  app.use('/perfil', restricted, perfilRouter);
  app.use('/restricted', restricted, restrictedRouter);
  ```



## CASO CHAT SIN REGISTRO:
1. En bin/www tener lo siguiente:
```javascript
var app = require('../app');
var debug = require('debug')('expresslogin:server');
var http = require('http');

// <!--Este const hay que ponerlo -->
const { Server } = require("socket.io");
<!--Espacio con cosas que vienen dadas-->
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('User connected');
  socket.on('chat', (msg) => {
    console.log("Mensaje recibido del cliente " + msg);
    io.emit('chat', msg);
  });
  socket.on('disconnect', () => {
    console.log('Usuario desconectado');
  });
});

```
2. En routes/chat.js hay que tener lo siguiente:

```javascript
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('chat', { title: 'SW1' });
});

module.exports = router;
```
3. En public/javascripts/chat.js:

```javascript
const socket = io();

const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

form.addEventListener('submit', (e)=> {
    e.preventDefault();
    if(input.value){
        socket.emit('chat', input.value);
        input.value = '';
    }
});

socket.on('chat', (msg) => {
    console.log("Mensaje recibido");
    const item = document.createElement("li");
    item.textContent = msg;
    messages.appendChild(item);
});
```

4. En views/chat.ejs:

```html
<!DOCTYPE html>
<html>
  <head>
    <title><%= title %></title>
    <link rel='stylesheet' href='/stylesheets/style.css' />
    <script src="/socket.io/socket.io.js" defer></script> 
    <script src="/javascripts/chat.js" defer></script> 
  </head>
  <body>
    <ul id="messages"></ul>
    <form id="form">
        <input id="input">
        <button>Send</button>
    </form>
  </body>
</html>
```

## Caso Foro:

1. En bin/www tener lo siguiente:
```javascript
var app = require('../app');
var debug = require('debug')('expresslogin:server');
var http = require('http');

// <!--Este const hay que ponerlo -->
const { Server } = require("socket.io");
<!--Espacio con cosas que vienen dadas-->
const io = new Server(server);

const messages = [];

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.emit('loadMessages', messages);
  socket.on('chat', (msg)=>{
      console.log("Mensaje recibido del cliente: " + msg);
      messages.push({username: msg.username, message:msg.message});
      io.emit('chat',  { username: msg.username, message: msg.message });
  });

  socket.on('disconnect', () => {
      console.log('user disconnected');
  });
});
```

2. En routes/chat.js tener lo siguiente:
Hay que tener en cuenta que puede pedir que la ruta se llame de forma distinta (chat, foro, restricted...)

```javascript
var express = require('express');
var router = express.Router();

const messages = [];
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('chat', { title: 'Chat', user: req.session.user, messages: messages});
});

module.exports = router;
```
3. En public/javascripts/chat.js tener lo siguiente:

Comprobar los ids de todos los elementos que recoja de la vista del chat. Han de tener el mismo id. Por ejemplo: Si en /restricted aparece el id de la lista como: "mensajes", habra que poner document.getElementById("mensajes");

```javascript
const socket = io();
const form = document.getElementById("form-chat");
const input = document.getElementById("input");
const messages = document.getElementById("messages");
const chatContainer = document.getElementById("chat-container");


socket.on("loadMessages", (previousMessages) => {
    previousMessages.forEach((msg) => {
        const item = document.createElement("li");
        item.textContent = `${msg.username}: ${msg.message}`;
        
        if (msg.username === username) {
            item.classList.add("current-user-message");
        } else {
            item.classList.add("other-user-message");
        }

        messages.appendChild(item);
    });
});

const username = chatContainer.getAttribute("data-username");
form.addEventListener('submit', function(e){
    e.preventDefault();
    if(input.value){
        socket.emit("chat", { message: input.value, username: username});
        input.value = "";
    }
});

socket.on("chat", (data) =>{
    const item = document.createElement("li");
    item.textContent = `${data.username}: ${data.message}`;

    if (data.username === username) {
        item.classList.add("current-user-message");
    } else {
        item.classList.add("other-user-message");
    }

    messages.appendChild(item);
    chatContainer.scrollTop = chatContainer.scrollHeight;
});
```
4. En views/chat.ejs:
 Los 2 includes solo se pone si pide header y footer (puede decirlo de esta manera: Cree esta página como una plantilla siguiendo la estructura del resto de páginas.)

```html
<%- include("header", {}) %>
    <h1>Foro</h1>

<div id="chat">
    <div id="chat-container" data-username="<%= user %>">
        <ul id="messages"></ul>
        <form id="form-chat">
            <input id="input" type="text" placeholder="Escribe tu mensaje">
            <button>Send</button>
        </form>
    </div>
</div>
<script src="/socket.io/socket.io.js" defer></script>
<script src="/javascripts/foro.js"defer ></script>

<%- include("footer", {}) %>


```
¡¡¡¡OJOOO!!!!! No olvidar estos scripts al final del HTML si no están en el caso de no estar en el header:

```html
<script src="/socket.io/socket.io.js"></script>
<script src="/javascripts/chat.js"></script>

<%- include("footer", {}) %>

```

5. Si pide algo específico en el CSS mirar el archivo del proyecto variaciones: public/stylesheets/style.css.
  a)

  ```css
  #chat {
  display: flex;
  justify-content: center;
  align-items: flex-start; 
  }

  #chat-container {
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 10px;
    width: 100%;
    height: 500px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    position: relative;
  }


  #messages {
    flex: 1;
    list-style-type: none;
    padding: 10px;
    margin: 0;
    overflow-y: auto;
    max-height: 400px;
  }


  .other-user-message {
    background: #cce5ff;
    border-radius: 10px;
    margin: 10px 5px;
    padding: 10px;
    text-align: left;
    max-width: 20%;
    margin-right: auto;
  }

  .current-user-message {
    background: #d4edda;
    border-radius: 10px;
    margin: 10px 5px;
    padding: 10px;
    text-align: right;
    max-width: 20%;
    margin-left: auto;
  }

  #form-chat {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background: #f8f9fa; 
    border-top: 1px solid #ddd;
    width: 100%;
    position: static;
    margin-top:  auto;
    border-radius: 10px;
  }

  #input {
    flex: 1;
    padding: 10px;
    margin-right: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 14px;
    box-sizing: border-box;
  }

  #form-chat button {
    background-color: #333;
    color: #fff;
    border: none;
    border-radius: 5px;
    padding: 5px 15px;
    cursor: pointer;
    width: 20%;
    font-size: 14px;
  }

  #form-chat button:hover {
    background-color: #555;
  }
  ```

 b) O en su defecnto en el proyecto foro_login:

```css
    body {
      padding: 50px;
      font: 14px "Lucida Grande", Helvetica, Arial, sans-serif;
    }

    a {
      color: #00B7FF;
    }

    #form-chat {
      background: lightgray;
      padding: 5px;
      position: fixed;
      display: flex;
      bottom: 0;
      left: 0;
      right: 0;
      margin: 0;
    }

    #input {
      flex-grow: 1;
    }

    #messages {
      list-style-type: none;
    }

    /* Estilo para mensajes enviados por otros usuarios */
    .other-user-message {
      background: lightblue;
      border-radius: 5px;
      margin: 5px 0;
      padding: 10px;
    }

    /* Estilo para mensajes enviados por el usuario actual */
    .current-user-message {
      background: lightgreen;
      border-radius: 5px;
      margin: 5px 0;
      padding: 10px;
    }
```


## CASO LOGIN Y REGISTRO CON USERS:
El código que se muestra a continuación es para un login y registro dado un archivo users.js tal y como está proporcionado en el proyecto login_y_registro/.

La lógica de usuarios la podrá variar levemente. Conviene analizar el código que proporcione para ver qué puede variar.

1. routes/login.js:

```javascript
const express = require('express');
const router = express.Router();
const users = require('../users');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Login', user: req.session.user});
});

router.post('/', function(req, res, next){
    let user = req.body.user;
    if(users[user]){
        users.comparePass(req.body.pass, users[user].hash, function(err, result){
            if(result){
                req.session.user = users[user];
                req.session.message = "Welcome!"
                res.redirect("/restricted");
            } else {
                req.session.error = "Incorrect user or password";
                res.redirect("/login");
            }
        });
    } else {
        req.session.error = "Incorrect user or password";
        res.redirect("/login");
    }
});

module.exports = router;
```

2. routes/registro.js:

Habrá que tener en cuenta que puede pedir que la ruta por ejemplo se llame /register.

```javascript

const express = require('express');
const router = express.Router();
const users = require('../users');

router.get('/', (req, res) => {
    res.render('registro', { title: 'Registro', user: req.session.user });
});

router.post('/', (req, res) => {
    const {username, password, confirmPassword} = req.body;

    if (password !== confirmPassword) {
        req.session.error = "Las contraseñas no coinciden.";
        return res.redirect('/registro');
    }

    if (users[username]) {
        req.session.error = "El usuario ya existe.";
        return res.redirect('/registro');

    }

    users.register(username, password, () => {
        req.session.user = users[username];
        req.session.message = "Usuario registrado de forma exitosa.";
        res.redirect('/restricted');
    });

});

module.exports = router;

```
3. views/login.ejs:
Los 2 includes solo se pone si pide header y footer (puede decirlo de esta manera: Cree esta página como una plantilla siguiendo la estructura del resto de páginas.)

```html
<%- include("header", {}) %>
<h1><%= title %></h1>
<form method="post" action="/login">
    <label>Username:</label>
    <input type="text" id="user" name="user"><br>
    <label>Password:</label>
    <input type="password" id="pass" name="pass">
    <button type="submit">Submit</button>
</form>
<%- include("footer", {}) %>
```
4. view/registro.ejs:

```html
<%- include("header", {}) %>
<h1>Registro</h1>
<form method="post" action="/registro">
    <label>Usuario:</label>
    <input type="text" name="username" required><br>
    <label>Contraseña:</label>
    <input type="password" name="password" id="password" required><br>
    <label>Repita la Contraseña:</label>
    <input type="password" name="confirmPassword" id="confirmPassword" required><br>
    <button type="submit" id="submitBtn">Registrar</button>
</form>

<!-- El script de a continuación se puede poner en un archvivo aparte en public/javascripts/registro.js e incluirlo como recurso: <script src="/javascripts/registro.js"></script> . En este caso se ha optado por incluirlo en la vista. -->

<script>
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");
    const submitBtn = document.getElementById("submitBtn");

    submitBtn.addEventListener("click", function (e) {
        if (password.value.length < 8) {
            alert("La contraseña debe tener al menos 8 caracteres.");
            e.preventDefault();
        } else if (password.value !== confirmPassword.value) {
            alert("Las contraseñas no coinciden.");
            e.preventDefault();
        }
    });
</script>
<%- include("footer", {}) %>
```

5. En el caso que se quiera implementar un Logout y no esté presente en app.js, se implementará de la siguiente forma en dicho archivo:

```javascript
app.use('/logout', function(req, res, next){
  req.session.destroy(function(){
    res.redirect("/");
  })
});
```

6. Para incluir todas estas opciones en el header seguirá esta estructura parecida (INCLUIR SOLO SI LO PIDE CON LAS LINEAS NECESARIAS PARA ELLO):

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tienda Banquillazo</title>
  <link rel="stylesheet" href="/stylesheets/style.css">
</head>
<body>
  <header>
    <h1>Tienda Sonny Angels</h1>
    <nav>
      <ul>
        <% if (user) { %>
          <li><a href="/restricted">Inicio</a></li>
          <li><a href="/productos">Productos</a></li>
          <li><a href="/carrito">Carrito</a></li>
          <li><a href="/foro">Foro</a></li>
          <li><a href="/perfil">Perfil</a></li>
          <li><a href="/logout">Cerrar sesión</a></li>
        <% } else { %>
          <li><a href="/">Inicio</a></li>
          <li><a href="/productos">Productos</a></li>
          <li><a href="/carrito">Carrito</a></li>
          <li><a href="/login">Login</a></li>
          <li><a href="/registro">Registro</a></li>
        <% } %>
      </ul>
      </nav>
  </header>
<main>
  ```

## CASO LOGIN CON DATABASE:
Para este caso, se mostrará el código aplicable para los ejemplos que ha puesto con la lógica de database/models/user.js. OJO AL CAMBIO EN DATABSE.USER/DATABASE.USERS  del database/index.js o algún cambio en la lógica que pueda hacer. 

1. Para routes/login.js:

```javascript
const express = require('express');
const router = express.Router();
const database = require('../database');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('login', { user: req.session.user});
});

router.post('/', async function(req, res, next) {
  const user = req.body.user;
  //Comprobación si el usuario es correcto
  if(await database.users.isLoginRight(user, req.body.pass)){
    req.session.message = "¡Login correcto!";
    req.session.user = {username: user};
    res.redirect('restricted');
  } else {
    req.session.error = "Usuario o contraseña incorrectas";
    res.redirect('login');
  }
});

module.exports = router;
```


2. Para views/login.ejs:

```html
<%- include("header", {}) %>
<h1><%= title %></h1>
<p>Welcome to Login</p>
<form action="/login" method="post">
  <label for="user">Username: </label><input type="text" name="user" id="user">
  <label for="pass">Password: </label><input type="password" name="pass" id="pass">
  <button type="submit">Submit</button>
</form>
<%- include("footer", {}) %>
```

3. Para routes/registro.js:

```javascript
const express = require('express');
const router = express.Router();
const database = require('../database');

router.get('/', (req, res) => {
  res.render('registro', { user: req.session.user});
});

router.post('/', (req, res) => {
  const { username, password, repeatPassword } = req.body;

  try {
    database.users.register(username, password);
    req.session.message = 'Usuario registrado exitosamente. Por favor, inicie sesión.';
    res.redirect('/login');
  } catch (error) {
    req.session.error = error.message;
    res.redirect('/registro');
  }
});

module.exports = router;
```

4. Para views/registro.ejs:

```html
<%- include("header") %>

<h2>Registro</h2>
<form method="post" action="/registro">
  <label for="username">Usuario:</label>
  <input type="text" id="username" name="username" required>

  <label for="password">Contraseña:</label>
  <input type="password" id="password" name="password" required >

  <label for="repeatPassword">Repetir contraseña:</label>
  <input type="password" id="repeatPassword" name="repeatPassword" required>

  <button type="submit">Registrar</button>
</form>

<%- include("footer") %>
```

## CASO TITLE

En el caso en el cual pida que el título se ponga en un único sitio sin especificar en archivo .env se podrá hacer de la siguiente forma:

1. En app.js poner esta línea de código:

```javascript

app.locals.title = "Tienda Sonny Angels";

```

2. En routes, no hay que especificar nada de title, ya que está indicado en el archivo raiz del servidor. Por ejemplo en login.js:
```javascript
router.get('/', (req, res) => {
  res.render('login', { user: req.session.user });
});
```

3. En la vista se llama al campo title de forma dinámica en el <head>:

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= title %></title>
  <link rel="stylesheet" href="/stylesheets/style.css">
</head>
```
#### INCISO:
Además de recoger en un único sitio el titulo podria pedir recoger dinámicamente en cada ruta el nombre de la funcionalidad para tenerlo en el encabezado de cada vista:

1. En las rutas:

```javascript
router.get('/', function(req, res, next) {
  res.render('index', {user:req.session.user, name: 'Home'});
});
```

2. En las vistas:

```html
<%- include("header") %>
<h2><%= name %></h2>
```



## CASOS ENV

### CASO PUERTO DADO EN .ENV:
En el caso en el que el puerto por el cual se ejecute el servidor se introduzca en un archivo .env, estará configurado de la siguiente manera

1. Un archivo .env que tendrá lo siguiente

```env
PORT="3010"
```
2. En bin/www, estará puesto de la siguiente manera. Solo se modifican las líneas comentadas. Las restantes vienen dadas por defecto:

```javascript
var app = require('../app');
require('dotenv').config(); // Este require es necesario para llevar a cabo este proceso. En el caso en que no esté instalado, nodejs pedirá instalar el módulo dotenv
var debug = require('debug')('puerto-3010:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT); // Se pide que el puerto por el cual se ejecute el servidor esté en el archivo .env
app.set('port', port);
```

### CASO TITLE EN .ENV:

Si pide decir el título, nombre o funcionalidad o cualquier otro campo en un archivo .env:

1. Creamos archivo .env con lo siguiente

```env
TITLE="Título"
```

2. No olvidar el require en cada ruta:

```javascript
require('dotenv').config();
```

3. En cada ruta ponemos el title en el get de la siguiente manera:

```javascript
router.get('/', function(req, res, next) {
  res.render('index', {user:req.session.user, title:process.env.TITLE});
});
```

3. En el header se pone recoge dinámicamente:
```html
<head>
    <title><%= title %></title>
    <link rel='stylesheet' href='/stylesheets/style.css'>
</head>

```
#### INCISO:
Además de recoger en un único sitio el titulo podria pedir recoger dinámicamente en cada ruta el nombre de la funcionalidad para tenerlo en el encabezado de cada vista:

1. En las rutas:

```javascript
router.get('/', function(req, res, next) {
  res.render('index', {user:req.session.user, title:process.env.TITLE, name: 'Home'});
});
```

2. En las vistas:

```html
<%- include("header") %>
<h2><%= name %></h2>
```

## CASO SCRIPTS:
En el caso en el que pida algo del estilo: 
"Cambie el código necesario para que la aplicación arranque ejecutando la siguiente instrucción:
npm start"

En el archivo package.json debe ir lo siguiente entre los campos "private" y  "dependencies":

```json
  "scripts": {
    "start": "node ./bin/www"
  },
```
Si además pidiese que se ejecutasen los tests que ha implementado él en el examen con "npm test", se podría pedir teóricamente de 2 formas:
1. Forma simple
```json
  "scripts": {
    "start": "node ./bin/www",
    "test": "jest"
  },
```
2. Forma algo más compleja: En la teoría (diapositiva 57 de Nodejs) está puesto lo siguiente:
En este caso, teóricamente debería dar la línea "unit" y saber implementar la línea correspondiente a "test"
```json
  "scripts": {
    "start": "node ./bin/www",
    "unit": "jest--configtest/unit/jest.conf.js --coverage",
    "test": "npm run unit"
  },
```


## CASO ADMIN 

PARA AÑADIR PRODUCTOS HAY UN CÓDIGO COMPLETO EN repaso_final/variaciones_admin !!!!!!!! VARÍA DATABASE, ROUTES Y LA VIEW DE ADMIN. La lógica de rol de administrador es lo mismo que en esta parte.

En el caso en el que se pida incluir una ruta solo accesible para aquellos usuarios con rol administrador, se hará de la siguiente forma. 

Se tiene en cuenta que se tiene  la lógica de usuarios propia de database/. Y en este ejemplo el adminsitrador podrá añadir productos a una lista de productos.

1. En database/models/user.model.js se actualiza la función register y se introduce el isAdmin:

```javascript
users.register = function(username, password, email='', role='user'){
    if(users.data.hasOwnProperty(username)){
        throw new Error(`Ya existe el usuario ${username}.`);
    }
    users.generateHash(password, function(err, hash){
        if(err){
            throw new Error(`Error al generar el hash de ${username}.`);
        }
        users.data[username] = {username, hash, email, role, last_Login: new Date().toISOString};
    });
}

users.isAdmin = function(username) {
    return users.data[username]?.role == 'admin';
}
```

2. En database/index.js se introducen usuarios admin para administrarse al arrancar la aplicación añadiendo lo siguiente:

```javascript
const database = {};

database.user = require('./models/user.model');

function initializeUsers(){
    const NAMES = ["alberto", "ana", "daniel", "silvia"];
    NAMES.forEach(function(username){
        database.user.register(username, "1234", "emailprueba@gmail.com");
    });
}

function initializeAdmin() { //Se añade esta función
    const USERS = [
        {username: 'admin', password:'admin1234', email: 'admin@gmail.com', role: 'admin'}
    ];
    USERS.forEach( user => {
        database.user.register(user.username, user.password, user.email, user.role);
    });
}
// Se inicializan tambien los Admin
function initializeDB(){
    initializeUsers();
    initializeAdmin();
}

initializeDB();

module.exports = database;
```
3. En app.js se ponen las siguientes características:

  a) La base de datos ha de estar importada

  ```javascript
  const database = require('./database');
  ```
  
 
  b) Se pone este app.use para implementar el rol de usuario en la sesión antes del use de las routes:

  ```javascript
  app.use((req, res, next) => {
    if (req.session.user) {
      const user = database.user.data[req.session.user];
      req.session.userRole = user.role;
    }
    res.locals.currentPath = req.path;
    res.locals.userRole = req.session.userRole || 'guest';
    next();
  });
  ```

   c) Se pone la siguiente función antes del use de las routes y despues de lo anterior:

  ```javascript
  function isAdmin(req, res, next) {
  if (req.session.user && req.session.userRole === 'admin') {
    return next();
  }
  res.status(403).send('Acceso denegado. Solo administradores.');
  }
  ```

  d) Se importa la ruta (se desarrollara a continuacion y se usará):

  ```javascript
  const adminRouter = require('./routes/admin');
  ```

  ```javascript
  app.use('/admin', isAdmin, adminRouter);
  ```

  4. En routes/admin.js

  ```javascript
  const express = require('express');
  const router = express.Router();


  const products = [
      { id: 1, name: 'Café Premium', price: 12},
      { id: 2, name: 'Auriculares Inalámbricos', price: 45 },
      { id: 3, name: 'Smartphone de Última Generación', price: 699},
      { id: 4, name: 'Zapatillas Deportivas', price: 80 }
    ];


  router.get('/', (req, res) => {
    res.render('admin', { products, user: req.session.user });
  });

  //Esto es para el caso particular. no tener en cuenta para implementar el admin
  router.post('/add-product', (req, res) => {
    const { name, price } = req.body;
    if (name && price) {
      const newProduct = { id: products.length + 1, name, price: parseFloat(price) };
      products.push(newProduct);
      req.session.message = 'Producto añadido exitosamente.';
    } else {
      req.session.error = 'Por favor, completa todos los campos.';
    }
    res.redirect('/admin');
  });

  module.exports = router;
  ```

5. En views/admin.ejs (Una vista normal para añadir productos):

```html
<%- include("header") %>

<h2>Administración de Productos</h2>

<% if (message) { %>
  <div class="success"><%= message %></div>
<% } %>
<% if (error) { %>
  <div class="error"><%= error %></div>
<% } %>

<h3>Productos existentes</h3>
<ul>
  <% products.forEach(product => { %>
    <li><%= product.name %> - <%= product.price %>€</li>
  <% }) %>
</ul>

<h3>Añadir Producto</h3>
<form method="post" action="/admin/add-product">
  <label for="name">Nombre del Producto:</label>
  <input type="text" id="name" name="name" required>

  <label for="price">Precio:</label>
  <input type="number" step="0.01" id="price" name="price" required>

  <button type="submit">Añadir Producto</button>
</form>

<%- include("footer") %>
```
6. En views/header.ejs por si se quiere poner en un menu de navegacion solo para admin :

```html
<nav>
      <ul>
        <% if (userRole === 'admin') { %>
          <li><a href="/admin">Administrador</a></li>
        <% } %>
        <% if (user) { %>
          <li><a href="/restricted">Inicio</a></li>
          <li><a href="/productos">Productos</a></li>
          <li><a href="/carrito">Carrito</a></li>
          <li><a href="/foro">Foro</a></li>
          <li><a href="/perfil">Perfil</a></li>
          <li><a href="/logout">Cerrar sesión</a></li>
        <% } else { %>
          <li><a href="/">Inicio</a></li>
          <li><a href="/productos">Productos</a></li>
          <li><a href="/carrito">Carrito</a></li>
          <li><a href="/login">Login</a></li>
          <li><a href="/registro">Registro</a></li>
        <% } %>
      </ul>
      </nav>
```
## CASOS COOKIES

### CASO COOKIES EN TODAS LAS RUTAS ( Guardado en base de datos en perfil):

1. En database/models/user.model.js se pone la siguiente función:

```javascript
users.cookies = function(username){
    users.data[username].cookies = true;
}
```

2. En app.js se pondrá lo siguiente:
  
  a) Se recoge la database en app.js en los require:

  ```javascript
  const database = require('./database');
  ```

  b) Se declarará las cookies como variable:

  ```javascript
  app.locals.cookiesAccepted = false;
  ```

  c) Se pondrá el método POST de cookies. (No hace falta incluir nada en ninguna ruta):
  ```javascript
  app.post('/cookies', (req, res, next) => {
  req.session.cookiesAccepted = true;
  app.locals.cookiesAccepted = true;

  if(req.session.user){
    database.user.cookies(req.session.user);
    console.log("Guardado en base de datos");
  }

  res.json({ success: true });
  });
  ```
3. En el javascripts/botonCookies.js:

```javascript
function aceptar() {
    var cookiesBanner = document.getElementById("cookies-banner");
    cookiesBanner.style.display = "none";

    fetch('/cookies', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cookiesAccepted: true })
    })
    .then(response => {
        if (response.ok) {
            console.log('Cookies aceptadas en el servidor');
        } else {
            console.error('Error al aceptar las cookies');
        }
    })
    .catch(error => console.error('Error en la solicitud:', error));
}

function rechazar() {
    window.location.href = "https://www.google.com";
}
```
4. En el footer.ejs:

```html
</main>
<footer>
  <% if (!cookiesAccepted) { %>
    <div class="cookies" id="cookies-banner">
        <h2>Cookies</h2>
        <p>¿Deseas aceptar las cookies?</p>
        <button onclick="aceptar()">Aceptar</button>
        <button onclick="rechazar()">Rechazar</button>
    </div>
  <% } %>
   <p>&copy; 2024 Tienda Express. Todos los derechos reservados.</p> <!-- Esto es un ejemplo. Depende de lo que haya por defecto -->
<script src="javascripts/botonCookies.js" defer></script>

</body>
</html>
```

5. Añadir en el login.js:

```javascript

if (await db.user.isLoginRight(username, password)) {
    req.session.user = username;
    req.session.message = 'Inicio de sesión exitoso.';

   // Se añade este if dentro del login 
  if(req.session.user){ 
    db.user.cookies(req.session.user);
  }
// Lo de entre comentarios
    res.redirect('/restricted');
  } else {
    req.session.error = 'Usuario o contraseña incorrectos.';
    res.redirect('/login');
  }
  ```

### CASO EN INDEX (RUTA DE HOME)
En el caso en el que nos pidan realizar una pestaña en el footer del index: (Si tiene que estar presente en todas las rutas se incluirá el footer en todas ellas con el parámetro correspondiente y se hará la misma ruta GET para todas). Hay una solucion mas eficiente arriba para eso.

1. En views/footer.ejs:

```html
</div> <!-- End container -->
<% if (message) { %>
    <div class="alert alert-primary alert-dismissible" role="alert">
    <div><%- message %></div>
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
<% } if (error) { %>
    <div class="alert alert-danger alert-dismissible" role="alert">
    <div><%- error %></div>
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
<% } %>
<!-- Inclusión de cookies -->
<% if (!cookiesAccepted) { %>
    <div class="cookies" id="cookies-banner">
        <h2>Cookies</h2>
        <p>¿Deseas aceptar las cookies?</p>
        <button onclick="aceptar()">Aceptar</button>
        <button onclick="rechazar()">Rechazar</button>
    </div>
<% } %>
<!--Se recoge el script una vez se realiza (más adelante). Primero conviene ir en orden HTML + CSS commits y luego la lógica-->
<script src="javascripts/botonCookies.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-OERcA2EqjJCMA+/3y+gxIOqMEjwtxJY7qPCqsdltbNJuaOe923+mo//f6V8Qbsw3" crossorigin="anonymous"></script>
</body>
</html>

```
2. En public/stylesheets/style.css (Dependerá de que estilo pida):
```css
#cookies-banner{
  background-color: gray;
  padding: 10px;
  position: fixed;
  text-align: center;
  bottom: 0;
  left: 0;
  right: 0;
  margin: 0;
}
```
3. En public/javascripts/botonCookies.js:

```javascript
function aceptar() {
    // Ocultar el banner de cookies
    var cookiesBanner = document.getElementById("cookies-banner");
    cookiesBanner.style.display = "none";

    // Enviar la solicitud POST con fetch para almacenar la aceptación en el servidor
    fetch('/cookies', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cookiesAccepted: true })
    })
    .then(response => {
        if (response.ok) {
            console.log('Cookies aceptadas en el servidor');
        } else {
            console.error('Error al aceptar las cookies');
        }
    })
    .catch(error => console.error('Error en la solicitud:', error));
}

function rechazar() {
    window.location.href = "https://www.google.com";
}
```
4. En views/index.ejs:
```html
<%- include("header", {}) %>
<h1><%= title %></h1>
<p>Bienvenido a <%= title %></p>
<p>Tu tienda Online favorita. Todo lo que puedas necesitar ¡Siempre al mejor precio!</p>
<%- include("footer", { cookiesAccepted: cookiesAccepted }) %>
```

5. En routes/index.js:

```javascript
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  const cookiesAccepted = req.session.cookiesAccepted || false;
  res.render('index', { 
      title: 'Armazón', 
      user: req.session.user,
      cookiesAccepted: cookiesAccepted
  });
});


// Ruta para manejar la aceptación de cookies
router.post('/cookies', (req, res) => {
  const cookiesAccepted = req.body.cookiesAccepted;

  if (cookiesAccepted) {
      // Puedes guardar esta información en la sesión
      req.session.cookiesAccepted = true;
      console.log('Cookies aceptadas y guardadas en la sesión');
      return res.status(200).json({ message: 'Cookies aceptadas' });
  }

  return res.status(400).json({ message: 'Error al procesar la solicitud' });
});

// Ruta para verificar el estado de las cookies
router.get('/cookies/status', (req, res) => {
  const cookiesAccepted = req.session.cookiesAccepted || false;
  return res.json({ cookiesAccepted });
});


module.exports = router;
```




## CASO CARRITO 2 FORMAS:

En el caso en el que se pida incluir la función de añadir un producto a un carrito,  se puede realizar de varias formas, dependiendo de la lógica dada y el lugar del método POST. Aquí hay 2 ejemplos:

### CASO POST EN PRODUCTOS:

1. En routes/product.js:

```javascript
const express = require('express');
const router = express.Router();

const products = [
  { id: 1, name: 'Matcha', description: 'Matcha de Starbucks', price: 5.99, image: '/images/matcha.jpg' },
  { id: 2, name: 'Pumpkin Spice', description: 'Pumpkin spice de Starbucks', price: 6.99, image: '/images/pumpkin.jpg' },
  { id: 3, name: 'Capuccino', description: 'Capuccino de Starbucks', price: 3.99, image: '/images/capuccino.jpg' },
];

router.get('/:id', (req, res) => {
  const productId = parseInt(req.params.id, 10);
  const product = products.find(p => p.id === productId);

  if (product) {
    res.render('product', { title: `Producto - ${product.name}`, product });
  } else {
    res.status(404).render('404', { title: 'Producto no encontrado' });
  }
});

router.post('/add-to-cart', (req, res) => {
  const { productId } = req.body;
  const product = products.find(p => p.id === parseInt(productId, 10));

  if (!product) {
    return res.status(404).render('404', { title: 'Producto no encontrado' });
  }

  if (!req.session.cart) req.session.cart = [];
  req.session.cart.push(product);
  res.redirect('/cart');
});

module.exports = router;
```
2. En views/product.ejs:

```html
<section class="product-detail">
    <h2><%= product.name %></h2>
    <img src="<%= product.image %>" alt="<%= product.name %>" class="product-image">
    <p><%= product.description %></p>
    <span class="price">$<%= product.price.toFixed(2) %></span>
    <form action="/product/add-to-cart" method="POST">
      <input type="hidden" name="productId" value="<%= product.id %>">
      <button type="submit" class="add-to-cart">Añadir al carrito</button>
    </form>
  </section>
```
3. En routes/cart.js (Se implementa también la función de eliminar producto):

```javascript
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const cart = req.session.cart || [];
  const totalPrice = cart.reduce((total, product) => total + product.price, 0);
  res.render('cart', { title: 'Carrito', cart, totalPrice });
});

router.post('/remove', (req, res) => {
  const { productId } = req.body;
  const cart = req.session.cart || [];
  req.session.cart = cart.filter(product => product.id !== parseInt(productId, 10));
  res.redirect('/cart');
});

module.exports = router;


```
4. En views/cart.ejs:

```html
<section class="cart">
    <h2>Carrito de Compras</h2>
    <ul>
      <% cart.forEach(product => { %>
        <li>
          <img src="<%= product.image %>" alt="<%= product.name %>" style="width: 50px;">
          <strong><%= product.name %></strong> - $<%= product.price.toFixed(2) %>
          <form action="/cart/remove" method="POST" style="display:inline;">
            <input type="hidden" name="productId" value="<%= product.id %>">
            <button type="submit">Eliminar</button>
          </form>
        </li>
      <% }) %>
    </ul>
    <p>Total: $<%= totalPrice.toFixed(2) %></p>
    <a href="/checkout" class="button">Proceder al Checkout</a>
  </section>
  ```

### CASO DE POST EN RUTA DE CARRITO:

1. En routes/productos.js:

```javascript
const express = require('express');
const router = express.Router();

// Lista de productos
const products = [
  { id: 1, name: 'Café Premium', price: 12, image: "https://www.quepasaahora.com/qpa_wp/wp-content/uploads/2018/09/Nescafe-Gold-1.jpg"},
  { id: 2, name: 'Auriculares Inalámbricos', price: 45, image: "https://img.michollo.com/wp-content/uploads/2018/08/airicu.webp" },
  { id: 3, name: 'Smartphone de Última Generación', price: 699, image: "https://i0.wp.com/www.frikipandi.com/wp-content/uploads/2022/09/vivo-x-fold-plus-lanzamiento-660x330.jpg" },
  { id: 4, name: 'Zapatillas Deportivas', price: 80, image: "https://www.mprosports.com/large/ZAPATILLA-DE-DEPORTE-SPORT-SALLER-SFA%2BTWO%2C-MARINO-LIMA-BLANCO.-i4167.jpg" }
];

router.get('/', (req, res) => {
  res.render('productos', { user: req.session.user, products });
});

module.exports = router;
```

2. En views/productos.ejs:
```html
<%- include("header") %>

<h2>Nuestros Productos</h2>
<div class="productos">
  <% products.forEach(product => { %>
    <div class="producto">
      <img src="<%= product.image %>" alt="<%= product.name %>">
      <h3><%= product.name %></h3>
      <p><%= product.description %></p>
      <p>Precio: <%= product.price %>€</p>
      <form method="post" action="/carrito/add">
        <input type="hidden" name="productId" value="<%= product.id %>">
        <button type="submit">Añadir al carrito</button>
      </form>
    </div>
  <% }) %>
</div>

<%- include("footer") %>
```

3. En routes/carrito.js:

```javascript
const express = require('express');
const router = express.Router();

const products = [
  { id: 1, name: 'Café Premium', price: 12 },
  { id: 2, name: 'Auriculares Inalámbricos', price: 45 },
  { id: 3, name: 'Smartphone de Última Generación', price: 699 },
  { id: 4, name: 'Zapatillas Deportivas', price: 80 }
];

router.use((req, res, next) => {
  if (!req.session.cart) {
    req.session.cart = { items: [], total: 0 };
  }
  next();
});

router.get('/', (req, res) => {
  res.render('carrito', { user: req.session.user, cart: req.session.cart });
});

router.post('/add', (req, res) => {
  const productId = parseInt(req.body.productId, 10);
  const product = products.find(p => p.id === productId);

  if (product) {
    req.session.cart.items.push(product);
    req.session.cart.total += product.price;
    req.session.message = `Producto añadido al carrito: ${product.name}`;
  } else {
    req.session.error = 'Producto no encontrado.';
  }

  res.redirect('/productos');
});

module.exports = router;
```
4. En views/carrito.ejs:

```html
<%- include("header") %>

<h2>Tu Carrito</h2>
<% if (cart.items.length > 0) { %>
  <ul>
    <% cart.items.forEach(item => { %>
      <li><%= item.name %> - <%= item.price %>€</li>
    <% }) %>
  </ul>
  <p>Total: <%= cart.total %>€</p>
<% } else { %>
  <p>Tu carrito está vacío.</p>
<% } %>

<%- include("footer") %>
```
5. En el caso en el que se pida una función para eliminar un producto del carrito, se pondrá el siguiente método post en la routes/carrito.js y en la views/carrito.ejs:

```javascript
router.post('/remove', (req, res) => {
  const cart = req.session.cart;
  const productId = parseInt(req.body.productId, 10);

  const productIndex = cart.items.findIndex(item => item.id === productId);

  if(productIndex > -1) {
    const product = cart.items[productIndex];
    cart.total -= product.price;
    cart.items.splice(productIndex, 1);
    req.session.message = `Producto eliminado del carrito: ${product.name}`;
  } else {
    req.session.error = "Producto no encontrado en el carrito.";
  }
  
  res.redirect('/carrito');
});
```
Vista completa de carrito actualizada:
```html
<%- include("header") %>

<h2>Tu Carrito</h2>
<% if (cart.items.length > 0) { %>
  <ul>
    <% cart.items.forEach(item => { %>
      <li><%= item.name %> - <%= item.price %>€</li>
      <form action="/carrito/remove" method="POST">
        <input type="hidden" name="productId" value="<%= item.id %>">
        <button type="submit">Eliminar</button>
      </form>
    <% }) %>
  </ul>
  <p>Total: <%= cart.total %>€</p>
<% } else { %>
  <p>Tu carrito está vacío.</p>
<% } %>

<%- include("footer") %>
```

## CASO RUTA PERFIL:
En el caso en el que se pida incluir una ruta perfil para actualizar la información como email o contraseña del usuario, se hará lo siguiente:

Nótese que este caso es para dado una lógica de usuarios para el caso database/, se podría considerar posteriormente para el archivo users.js, que seria de forma similar.

1. En routes/perfil.js:

```javascript
const express = require('express');
const router = express.Router();
const database = require('../database');
const bcrypt = require('bcrypt');

router.get('/', (req, res) => {
  const user = database.user.data[req.session.user];
  res.render('perfil', { user });
});

// Actualizar nombre usuario
router.post('/update-username', (req, res) => {
  const { newUsername } = req.body;
  const currentUsername = req.session.user;

  if (newUsername !== currentUsername && !database.user.data[newUsername]) {
    database.user.data[newUsername] = { ...database.user.data[currentUsername], username: newUsername };
    delete database.user.data[currentUsername];
    req.session.user = newUsername;
    req.session.message = 'Nombre de usuario actualizado exitosamente.';
  } else if (database.user.data[newUsername]) {
    req.session.error = 'El nombre de usuario ya está en uso.';
  }

  res.redirect('/perfil');
});

// Actualizar el correo electrónico
router.post('/update-email', (req, res) => {
  const { newEmail } = req.body;

  if (newEmail) {
    database.user.data[req.session.user].email = newEmail;
    req.session.message = 'Correo electrónico actualizado exitosamente.';
  } else {
    req.session.error = 'El correo electrónico no puede estar vacío.';
  }

  res.redirect('/perfil');
});

// Actualizar la contraseña
router.post('/update-password', async (req, res) => {
  const { newPassword } = req.body;

  if (newPassword.length >= 6) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    database.user.data[req.session.user].hash = hashedPassword;
    req.session.message = 'Contraseña actualizada exitosamente.';
  } else {
    req.session.error = 'La contraseña debe tener al menos 6 caracteres.';
  }

  res.redirect('/perfil');
});

module.exports = router;
```

2. En views/perfil.ejs:

```html
<%- include("header") %>
<h2>Perfil</h2>

<% if (message) { %>
  <div class="success"><%= message %></div>
<% } %>
<% if (error) { %>
  <div class="error"><%= error %></div>
<% } %>

<p><strong>Nombre de usuario:</strong> <%= user.username %></p>
<p><strong>Correo electrónico:</strong> <%= user.email  %></p>

<form method="post" action="/perfil/update-username">
  <label for="newUsername">Nuevo nombre de usuario:</label>
  <input type="text" id="newUsername" name="newUsername" value="<%= user.username %>" required>
  <button type="submit">Actualizar nombre de usuario</button>
</form>


<form method="post" action="/perfil/update-email">
  <label for="newEmail">Nuevo correo electrónico:</label>
  <input type="email" id="newEmail" name="newEmail" value="<%= user.email || '' %>" required>
  <button type="submit">Actualizar correo</button>
</form>


<form method="post" action="/perfil/update-password">
  <label for="newPassword">Nueva contraseña:</label>
  <input type="password" id="newPassword" name="newPassword" minlength="6" required>
  <button type="submit">Actualizar contraseña</button>
</form>

<%- include("footer") %>
```

3. Inluir en el header, donde corresponde ( dentro del if (user)) el enlace al perfil.

ESTE CASO DEPENDERÁ DE LA LÓGICA DE LA BASE DE DATOS TAMBIEN !!!!


## CASO CHAT PRIVADO:

En el caso en el que se solicite un chat privado entre 2 usuarios logeados, se procederá se la siguiente manera:

1. Para el archivo bin/www:

```javascript
const { Server } = require("socket.io");
 // Espacio con código entre medias
 const io = new Server(server);
 const privateMessages = {}; // Mensajes de chats privados, organizados por sala
 const userRooms = {};

io.on('connection', (socket) => {
  console.log('A user connected');
// Unirse a una sala privada
  socket.on('joinPrivateRoom', ({ from, to }) => {
    const room = [from, to].sort().join('_'); // Crear ID único para la sala
    if (!userRooms[from]) userRooms[from] = new Set();
    if (!userRooms[to]) userRooms[to] = new Set();

    userRooms[from].add(room);
    userRooms[to].add(room);
    socket.join(room);
    if (!privateMessages[room]) privateMessages[room] = [];
    socket.emit('loadPrivateMessages', privateMessages[room]); // Enviar mensajes previos de la sala
    console.log(`${from} joined private room with ${to}. Sala: ${room}`);
  });


  // Enviar mensajes privados
  socket.on('privateChat', ({ room, message, username }) => {
    if (!userRooms[username] || !userRooms[username].has(room)) {
      console.log(`Usuario no autorizado para enviar mensajes a la sala ${room}`);
      return;
    }

    if (!privateMessages[room]) privateMessages[room] = [];
    privateMessages[room].push({ username, message });
    io.to(room).emit('privateChat', { username, message });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

```

2. En routes/chat.js:

```javascript
const express = require('express');
const router = express.Router();

router.get('/', function (req, res, next) {
  res.render('chat', { title: 'Chat Privado', user: req.session.user });
});

module.exports = router;
```

3. En public/javascripts/chat.js:

```javascript
const socket = io();
const form = document.getElementById("form-chat");
const input = document.getElementById("input");
const messages = document.getElementById("messages");
const userSearch = document.getElementById("username"); // Campo para buscar usuarios (chat privado)
const startChat = document.getElementById("start-chat"); // Botón para iniciar chat privado
const chatContainer = document.getElementById("chat-container"); // Contenedor del chat

const privateMessages = document.getElementById("private-messages"); // Contenedor de mensajes privados
let currentRoom = null; // Sala actual en chat privado

const username = chatContainer ? chatContainer.getAttribute("data-username") : null; // Usuario logueado

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

  socket.on('loadPrivateMessages', (messages) => {
    privateMessages.innerHTML = '';
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
      privateMessages.scrollTop = privateMessages.scrollHeight;
    }
  });
}

form.addEventListener('submit', function (e) {
  e.preventDefault();
  if (input.value) {
    if (currentRoom) {
      socket.emit('privateChat', { room: currentRoom, message: input.value, username });
    } else {
      socket.emit('chat', { message: input.value, username });
    }
    input.value = '';
  }
});
```
4. views/chat.ejs:

```html
<%- include("header", {}) %>
<h1><%= title %></h1>
<p>Welcome to private chat</p>

<div id="user-search">
    <label for="username">Buscar usuario:</label>
    <input id="username" type="text" placeholder="Usuario">
    <button id="start-chat">Iniciar Chat</button>
  </div>
  
  <div id="chat-container" data-username="<%= user.username %>">
    <ul id="private-messages"></ul>
    <form id="form-chat">
      <input id="input" autocomplete="off">
      <button>Send</button>
    </form>
  </div>
  

<script src="/socket.io/socket.io.js"></script>
<script src="/javascripts/chat.js"></script>

<%- include("footer", {}) %>
```

5. Si pide algo específico en el CSS mirar el archivo del proyecto chat_privado_y_foro: public/stylesheets/style.css.


## ANEXO:
1. Un ejemplo completo de app.js con registro, login y chat es el siguiente. Aquí están implementadas todas las funcionalidades y rutas.

```javascript
let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
const session = require('express-session');

let indexRouter = require('./routes/index');
let loginRouter = require('./routes/login');
let restrictedRouter = require('./routes/restricted');
let registroRouter = require('./routes/registro');
let chatRouter = require('./routes/chat');
let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: 'El secreto que queramos nosotros'
}));

app.use(function(req, res, next){
  let error = req.session.error;
  let message = req.session.message;
  delete req.session.error;
  delete req.session.message;
  res.locals.error = "";
  res.locals.message = "";
  if (error) res.locals.error = `<p>${error}</p>`;
  if (message) res.locals.message = `<p>${message}</p>`;
  next();
});

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/restricted', restrict, restrictedRouter);
app.use('/registro', registroRouter);
app.use('/logout', function(req, res, next){
  req.session.destroy(function(){
    res.redirect("/");
  })
});
app.use('/chat', chatRouter);

function restrict(req, res, next){
  if(req.session.user){
    next();
  } else {
    req.session.error = "Unauthorized access";
    res.redirect("/login");
  }
}
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
```


2. En el caso en el que se pida poner algún enlace o elemento en el encabezado de la web o en el footer, se procederán a usar los distintos archivos ( en el caso en el que la estructura esté organizada de esta manera)

# EJEMPLO HEADER:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= title %></title>
  <link rel="stylesheet" href="/stylesheets/style.css">
</head>
<body>
  <header>
    <h1>Tienda Sonny Angels</h1>
    <nav>
      <ul>
        <% if (user) { %>
          <li><a href="/restricted">Inicio</a></li>
          <li><a href="/productos">Productos</a></li>
          <li><a href="/carrito">Carrito</a></li>
          <li><a href="/foro">Foro</a></li>
          <li><a href="/perfil">Perfil</a></li>
          <li><a href="/logout">Cerrar sesión</a></li>
        <% } else { %>
          <li><a href="/">Inicio</a></li>
          <li><a href="/productos">Productos</a></li>
          <li><a href="/carrito">Carrito</a></li>
          <li><a href="/login">Login</a></li>
          <li><a href="/registro">Registro</a></li>
        <% } %>
      </ul>
      </nav>
  </header>
<main>

```
# EJEMPLO FOOTER:

```html
<% if (message) { %>
<div class="alert alert-primary" role="alert">
    <%- message %>
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
</div>
<% } if (error) { %>
<div class="alert alert-danger" role="alert">
    <%- error %>
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
</div>
<% } %>
</body>
</html>

```

