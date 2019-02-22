var express = require('express');
var router = express.Router();
var passport = require('passport');
var localStrategy= require('passport-local').Strategy;

var User = require('../model/user')

// Get Resgister
router.get('/register', function(req, res){
    res.render('register');
});

// Get Login
router.get('/login', function(req, res){
    res.render('login');
});

// Post Resgister
router.post('/register', function(req, res){
    var name = req.body.name;
    var username = req.body.username;
    var email = req.body.email;
    var pass = req.body.pass;
    var pass2 = req.body.pass2;

    //Validate
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('username', 'User Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('pass', 'Password is required').notEmpty();
    req.checkBody('pass2', 'Passwords do not match').equals(pass);

    var errors = req.validationErrors();

    if(errors){
        res.render('register', {
            errors:errors
        })
    } else{
        var newUser = new User({
            name:name,
            username:username,
            email:email,
            password:pass
        });

        User.createUser(newUser, function(err, user){
            if(err) throw err;
            console.log(user);
        });

        req.flash('success_msg', 'Registration Done!, You can now Login.'
        );

        res.redirect('/users/login');
    }
});

passport.use(new localStrategy(
    function(username, password, done) {
      User.getUserByUsername(username, function(err, user){
          if(err) throw err;
          if(!user){
              return done(null, false, {message: 'Unknown Username'});
          }
          User.comparePassword(password, user.password, function(err, isMatch){
              if(err) throw err;
              if(isMatch){
                  return done(null, user);
              } else {
                  return done(null, false, {message:'Invalid Password'});
              }
          });
      });
    }));

    passport.serializeUser(function(user, done) {
        done(null, user.id);
      });
      
      passport.deserializeUser(function(id, done) {
        User.getUserById(id, function(err, user) {
          done(err, user);
        });
      });

router.post('/login',
  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login', failureFlash:true}),
  function(req, res) {
    res.redirect('/');
});

router.get('/logout', function(req, res, next){
    req.logout();

    req.flash('success_msg', 'You are now logged out');

    res.redirect('/users/login');
});
module.exports = router;