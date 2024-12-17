const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');

const indexRouter = require('./routes/index');
const productRouter = require('./routes/product');
const cartRouter = require('./routes/cart');
const checkoutRouter = require('./routes/checkout');
const thankyouRouter = require('./routes/thankyou');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout');

app.use(
    session({
        secret: 'mi_secreto_tienda',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }
    })
);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/product', productRouter);
app.use('/cart', cartRouter);
app.use('/checkout', checkoutRouter);
app.use('/thankyou', thankyouRouter);

app.use(function(req, res, next) {
    next(createError(404));
});

app.use(function(err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error', { title: 'Error' });
});

module.exports = app;
