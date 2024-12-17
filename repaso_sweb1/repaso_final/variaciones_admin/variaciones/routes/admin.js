const express = require('express');
const router = express.Router();
const { products, addProduct, removeProduct } = require('../database/products');
const users = require('../database/models/user.model');



router.get('/', (req, res) => {
  const allUsers = users.getAll();
  res.render('admin', { products, users: allUsers, user:req.session.user });
});


router.post('/add-product', (req, res) => {
  const { name, price, image } = req.body;
  if (name && price) {
    addProduct(name, price, image);
    req.session.message = 'Producto añadido exitosamente.';
  } else {
    req.session.error = 'Por favor, completa todos los campos.';
  }
  res.redirect('/admin');
});

router.post('/remove-product', (req, res) => {
  const productId = parseInt(req.body.productId, 10);
  removeProduct(productId);
  req.session.message = 'Producto eliminado exitosamente.';
  res.redirect('/admin');
});


router.post('/remove-user', (req, res) => {
  const { username } = req.body;
  if (users.remove(username)) {
    req.session.message = `Usuario ${username} eliminado exitosamente.`;
  } else {
    req.session.error = 'El usuario no existe.';
  }
  res.redirect('/admin');
});


module.exports = router;
