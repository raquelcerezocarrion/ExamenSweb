const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('thankyou', { title: 'Gracias por tu compra' });
});

module.exports = router;
