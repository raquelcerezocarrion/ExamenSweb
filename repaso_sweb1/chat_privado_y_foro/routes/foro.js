const express = require('express');
const router = express.Router();

const messages = []; // Mensajes del foro

router.get('/', function (req, res, next) {
  res.render('foro', { title: 'Foro General', user: req.session.user, messages });
});

module.exports = router;
