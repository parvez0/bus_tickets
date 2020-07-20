const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morganLogger = require('morgan');

const responseHandler = require('./middlewares/responseHandler');
const auth = require('./middlewares/auth');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.use(morganLogger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(responseHandler);

app.use('/health-check', (req, res) => res.publish(true, 'application working !!'));
app.use('/', indexRouter);
app.use('/user', auth, usersRouter);
app.use('/admin', auth, adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res) {
    res.status(404).send('Not found');
});

// error handler
app.use(function (err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
