var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
const { json } = require('express');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dataRouter = require('./routes/data');
var dataDateRouter = require('./routes/datadate');
var mapsRouter = require('./routes/maps');


const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/cmsdb', { useNewUrlParser: true, useUnifiedTopology: true });
console.log(`You're connected to server!`)

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/data', dataRouter);
app.use('/api/datadate', dataDateRouter);
app.use('/api/maps', mapsRouter);



module.exports = app;
