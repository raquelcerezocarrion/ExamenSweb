const express = require('express');
require('dotenv').config();
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('tienda', {user:req.session.user, title:process.env.TITLE});
});

module.exports = router;
