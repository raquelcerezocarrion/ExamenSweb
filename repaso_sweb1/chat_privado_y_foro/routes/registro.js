const express = require('express');
const router = express.Router();
const users = require('../users');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('registro', { title: 'Registro', user: req.session.user});
});

router.post('/', function(req, res, next){
    let user = req.body.user;
    let pass = req.body.pass;
    if(!users[user]){
        users.register(user, pass, function() {
            req.session.user = users[user];
            console.log("User:\t" + user+ "\tsuccessfully registred");
            console.log("Pass:\t" + pass + "\tsuccessfully registred");

            req.session.message = 'Usuario registrado!';
            res.redirect('/restricted');
        });
    } else {
        req.session.error = 'El usuario ya está registrado.';
        res.redirect('/login');
    }
});

module.exports = router;