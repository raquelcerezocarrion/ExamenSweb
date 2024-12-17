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
