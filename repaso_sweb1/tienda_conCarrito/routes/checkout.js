const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const cart = req.session.cart || [];
  const totalPrice = cart.reduce((total, product) => total + product.price, 0);

  if (cart.length === 0) {
    return res.redirect('/cart');
  }

  res.render('checkout', { title: 'Checkout', cart, totalPrice });
});

router.post('/process', (req, res) => {
  const { nombre, direccion } = req.body;
  const cart = req.session.cart || [];

  if (cart.length === 0) {
    return res.redirect('/cart');
  }

  console.log('Pedido procesado para:', nombre, direccion);
  console.log('Productos:', cart);
  req.session.cart = [];

  res.render('thankyou', { title: 'Gracias por tu compra', nombre });
});

module.exports = router;
