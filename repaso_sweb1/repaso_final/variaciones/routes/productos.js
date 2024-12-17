const express = require('express');
const router = express.Router();

// Lista de productos
const products = [
  { id: 1, name: 'Café Premium', price: 12, image: "https://www.quepasaahora.com/qpa_wp/wp-content/uploads/2018/09/Nescafe-Gold-1.jpg"},
  { id: 2, name: 'Auriculares Inalámbricos', price: 45, image: "https://img.michollo.com/wp-content/uploads/2018/08/airicu.webp" },
  { id: 3, name: 'Smartphone de Última Generación', price: 699, image: "https://i0.wp.com/www.frikipandi.com/wp-content/uploads/2022/09/vivo-x-fold-plus-lanzamiento-660x330.jpg" },
  { id: 4, name: 'Zapatillas Deportivas', price: 80, image: "https://www.mprosports.com/large/ZAPATILLA-DE-DEPORTE-SPORT-SALLER-SFA%2BTWO%2C-MARINO-LIMA-BLANCO.-i4167.jpg" }
];

router.get('/', (req, res) => {
  res.render('productos', { user: req.session.user, products });
});

module.exports = router;
