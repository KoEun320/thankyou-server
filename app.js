var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var index = require('./routes');
var cors = require('cors');

var app = express();

if(process.env.NODE_ENV === 'production') {
  console.log('Production');
} else {
  console.log('Development');
}

//Connect to Database
const DB_URL = "mongodb://admin:adminadmin1234@ds257590.mlab.com:57590/thankyou";

mongoose.connect(DB_URL, { useNewUrlParser: true });

const db = mongoose.connection;

db.once('open', function () {
  console.log('connected to database at ' + DB_URL);
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500).end();
});

module.exports = app;
