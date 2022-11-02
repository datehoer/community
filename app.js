const express = require('express');
const path = require('path');
// 提供默认的favicon
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const routes = require('./routes/index');
const validate = require('./middleware/validate')
const users = require('./routes/user');
const entries = require('./models/entries');
const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// 输出有颜色区分的日志，便于开发调试
app.use(logger('dev'));
// 解析请求主题
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// 提供静态文件
app.use(express.static(path.join(__dirname, 'public')));

// 指定程序路由
app.use('/', entries.list);
app.use('/users', users);

app.get('/post', entries.form);
app.post(
    '/post',
    validate.required('entry[title]'),
    validate.lengthAbove('entry[title]', 4),
    entries.submit
    )

app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
})

// 在开发时显示样式话的HTML错误页面
if(app.get('env') === 'development'){
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
})

module.exports = app;