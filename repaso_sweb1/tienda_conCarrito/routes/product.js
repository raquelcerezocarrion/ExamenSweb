const express = require('express');
const router = express.Router();

const products = [
  { id: 1, name: 'Matcha', description: 'Matcha de Starbucks', price: 5.99, image: '/images/matcha.jpg' },
  { id: 2, name: 'Pumpkin Spice', description: 'Pumpkin spice de Starbucks', price: 6.99, image: '/images/pumpkin.jpg' },
  { id: 3, name: 'Capuccino', description: 'Capuccino de Starbucks', price: 3.99, image: '/images/capuccino.jpg' },
];

router.get('/:id', (req, res) => {
  const productId = parseInt(req.params.id, 10);
  const product = products.find(p => p.id === productId);

  if (product) {
    res.render('product', { title: `Producto - ${product.name}`, product });
  } else {
    res.status(404).render('404', { title: 'Producto no encontrado' });
  }
});

router.post('/add-to-cart', (req, res) => {
  const { productId } = req.body;
  const product = products.find(p => p.id === parseInt(productId, 10));

  if (!product) {
    return res.status(404).render('404', { title: 'Producto no encontrado' });
  }

  if (!req.session.cart) req.session.cart = [];
  req.session.cart.push(product);
  res.redirect('/cart');
});

module.exports = router;
