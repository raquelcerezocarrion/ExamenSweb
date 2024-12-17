const express = require('express');
const router = express.Router();
const database = require('../database');

router.get('/', (req, res) => {
    res.render('registro', { title: 'Registro',  user: req.session.user });
});

router.post('/', (req, res) => {
  const { username, email, password, repeatPassword } = req.body;

  if (password !== repeatPassword) {
    req.session.error = 'Las contraseñas no coinciden.';
    return res.redirect('/registro');
  }

  if (password.length < 8) {
    req.session.error = 'La contraseña debe tener al menos 8 caracteres.';
    return res.redirect('/registro');
  }

  try {
    database.user.register(username, password, email);
    req.session.message = 'Usuario registrado exitosamente. Por favor, inicie sesión.';
    res.redirect('/login');
  } catch (error) {
    req.session.error = error.message;
    res.redirect('/registro');
  }
});

module.exports = router;