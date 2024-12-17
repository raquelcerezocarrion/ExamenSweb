const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  res.render('login', { user: req.session.user });
});

router.post('/', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    req.session.error = 'Por favor, complete todos los campos.';
    return res.redirect('/login');
  }

  if (await db.user.isLoginRight(username, password)) {
    req.session.user = username;
    req.session.message = 'Inicio de sesión exitoso.';

    
  if(req.session.user){
    db.user.cookies(req.session.user);
  }

    res.redirect('/restricted');
  } else {
    req.session.error = 'Usuario o contraseña incorrectos.';
    res.redirect('/login');
  }

});

module.exports = router;
