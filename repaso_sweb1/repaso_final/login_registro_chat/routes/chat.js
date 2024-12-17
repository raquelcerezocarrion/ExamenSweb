var express = require('express');
var router = express.Router();

const messages = [];
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('chat', { title: 'Chat', user: req.session.user, messages: messages});
});

module.exports = router;