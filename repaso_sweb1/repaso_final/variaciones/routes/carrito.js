const express = require('express');
const router = express.Router();

const products = [
  { id: 1, name: 'Café Premium', price: 12 },
  { id: 2, name: 'Auriculares Inalámbricos', price: 45 },
  { id: 3, name: 'Smartphone de Última Generación', price: 699 },
  { id: 4, name: 'Zapatillas Deportivas', price: 80 }
];

router.use((req, res, next) => {
  if (!req.session.cart) {
    req.session.cart = { items: [], total: 0 };
  }
  next();
});

router.get('/', (req, res) => {
  res.render('carrito', { user: req.session.user, cart: req.session.cart });
});

router.post('/add', (req, res) => {
  const productId = parseInt(req.body.productId, 10);
  const product = products.find(p => p.id === productId);

  if (product) {
    req.session.cart.items.push(product);
    req.session.cart.total += product.price;
    req.session.message = `Producto añadido al carrito: ${product.name}`;
  } else {
    req.session.error = 'Producto no encontrado.';
  }

  res.redirect('/productos');
});

router.post('/remove', (req, res) => {
  const cart = req.session.cart;
  const productId = parseInt(req.body.productId, 10);

  const productIndex = cart.items.findIndex(item => item.id === productId);

  if(productIndex > -1) {
    const product = cart.items[productIndex];
    cart.total -= product.price;
    cart.items.splice(productIndex, 1);
    req.session.message = `Producto eliminado del carrito: ${product.name}`;
  } else {
    req.session.error = "Producto no encontrado en el carrito.";
  }
  
  res.redirect('/carrito');
});

module.exports = router;
