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