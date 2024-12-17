var express = require('express');
var router = express.Router();

const messages = [];
router.get('/', function(req, res, next) {
  res.render('foro', { user: req.session.user, messages: messages});
});

module.exports = router;