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
