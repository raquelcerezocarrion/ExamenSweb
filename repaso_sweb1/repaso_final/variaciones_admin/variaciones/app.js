const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const indexRouter = require('./routes/index');
const loginRouter = require('./routes/login');

const productosRouter = require('./routes/productos');
const carritoRouter = require('./routes/carrito');
const restrictedRouter = require('./routes/restricted');
const registroRouter = require('./routes/registro');
const perfilRouter = require('./routes/perfil');
const foroRouter = require('./routes/foro');
const adminRouter = require('./routes/admin');

const database = require('./database');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: "Una frase muy secreta",
  resave: false,
  saveUninitialized: true
}));

app.use((req, res, next) => {
  const message = req.session.message;
  const error = req.session.error;
  delete req.session.message;
  delete req.session.error;
  res.locals.message = "";
  res.locals.error = "";
  if (message) res.locals.message = `${message}`;
  if (error) res.locals.error = `${error}`;
  next();
});


app.use((req, res, next) => {
  if (req.session.user) {
    const user = database.user.data[req.session.user];
    req.session.userRole = user.role;
  }
  res.locals.currentPath = req.path;
  res.locals.userRole = req.session.userRole || 'guest';
  next();
});

function restricted(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
}

function isAdmin(req, res, next) {
  if (req.session.user && req.session.userRole === 'admin') {
    return next();
  }
  res.status(403).send('Acceso denegado. Solo administradores.');
}


app.locals.cookiesAccepted = false;

// Use routes
app.use('/', indexRouter);
app.use('/login', loginRouter);

app.use('/productos', productosRouter);
app.use('/carrito', carritoRouter);
app.use('/restricted', restricted, restrictedRouter);
app.use('/registro', registroRouter);
app.use('/logout', (req,res) =>{
  req.session.destroy();
  res.redirect("/");
});
app.use('/perfil', restricted, perfilRouter);
app.use('/foro', restricted, foroRouter);
app.use('/admin', isAdmin, adminRouter);

app.post('/cookies', (req, res, next) => {
  req.session.cookiesAccepted = true;
  app.locals.cookiesAccepted = true;

  if(req.session.user){
    database.user.cookies(req.session.user);
    console.log("Guardado en base de datos");
  }

  res.json({ success: true });
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});


app.locals.title = "Tienda Sonny Angels";

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
