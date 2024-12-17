const express = require('express');
require('dotenv').config();
const router = express.Router();

router.get('/', function(req, res) {
  res.render('restricted', {user: req.session.user, title:process.env.TITLE});
});

module.exports = router;
