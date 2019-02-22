var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var localStrategy= require('passport-local').Strategy;
var mongo= require('mongodb');
var mongoose= require('mongoose');
mongoose.connect('mongodb://localhost/loginreg', { useNewUrlParser: true });
var db = mongoose.connection;

var routes = require('./routes/index');
var users = require('./routes/users');

//Initialize App
var app = express();

//View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');

// bp middle
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
// app.use(cookieParser());

//static folder
app.use(express.static(path.join(__dirname, 'public')));

//Express-Session
app.use(session({
    secret:'hmv',
    saveUninitialized: true,
    resave: true
}));

//Passport
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;
  
      while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param : formParam,
        msg   : msg,
        value : value
      };
    }
  }));

  // Connect Flash
  app.use(flash());

  //Global Varialbles
  app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
  });

app.use('/' , routes);
app.use('/users' , users);

//port
const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));