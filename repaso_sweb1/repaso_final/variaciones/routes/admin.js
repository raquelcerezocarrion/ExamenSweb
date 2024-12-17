const express = require('express');
const router = express.Router();


const products = [
    { id: 1, name: 'Café Premium', price: 12},
    { id: 2, name: 'Auriculares Inalámbricos', price: 45 },
    { id: 3, name: 'Smartphone de Última Generación', price: 699},
    { id: 4, name: 'Zapatillas Deportivas', price: 80 }
  ];


router.get('/', (req, res) => {
  res.render('admin', { products, user: req.session.user });
});


router.post('/add-product', (req, res) => {
  const { name, price } = req.body;
  if (name && price) {
    const newProduct = { id: products.length + 1, name, price: parseFloat(price) };
    products.push(newProduct);
    req.session.message = 'Producto añadido exitosamente.';
  } else {
    req.session.error = 'Por favor, completa todos los campos.';
  }
  res.redirect('/admin');
});

module.exports = router;
