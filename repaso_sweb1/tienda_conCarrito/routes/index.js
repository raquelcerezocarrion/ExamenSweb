var express = require('express');
var router = express.Router();

const products = [
  { id: 1, name: 'Matcha', description: 'Matcha de Starbucks', price: 5.99, image: '/images/matcha.jpg' },
  { id: 2, name: 'Pumpkin Spice', description: 'Pumpkin spice de Starbucks', price: 6.99, image: '/images/pumpkin.jpg' },
  { id: 3, name: 'Capuccino', description: 'Capuccino de Starbucks', price: 3.99, image: '/images/capuccino.jpg' },
];

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Inicio - Tienda Online', products });
});

module.exports = router;
