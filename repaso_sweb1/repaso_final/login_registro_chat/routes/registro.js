
const express = require('express');
const router = express.Router();
const users = require('../users');

router.get('/', (req, res) => {
    res.render('registro', { title: 'Registro', user: req.session.user });
});

router.post('/', (req, res) => {
    const {username, password, confirmPassword} = req.body;

    if (password !== confirmPassword) {
        req.session.error = "Las contraseñas no coinciden.";
        return res.redirect('/registro');
    }

    if (users[username]) {
        req.session.error = "El usuario ya existe.";
        return res.redirect('/registro');

    }

    users.register(username, password, () => {
        req.session.user = users[username];
        req.session.message = "Usuario registrado de forma exitosa.";
        res.redirect('/restricted');
    });

});

module.exports = router;
