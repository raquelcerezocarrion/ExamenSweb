const express = require('express');
const router = express.Router();
const { products } = require('../database/products');

router.get('/', (req, res) => {
  res.render('productos', { user: req.session.user, products });
});

module.exports = router;
