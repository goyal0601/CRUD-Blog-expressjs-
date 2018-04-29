const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// bring in article model
let User = require('../models/user');

//Register Form
router.get('/register', function(req, res){
    res.render('register');
});

router.post('/register', function(req, res){
    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const password2 = req.body.password2;

    req.checkBody('name', 'Name should not be Empty').notEmpty();
    req.checkBody('email', 'Email should not be Empty').notEmpty();
    req.checkBody('email', 'Invalid email').isEmail();
    req.checkBody('username', 'User Name is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Password doesnot match').equals(req.body.password);

    var errors  = req.validationErrors();

	if(errors){
        res.render('register', {
            errors:errors
    });
	}else{
    let newUser = new User({
        name: name,
        username:username,
        email:email,
        password:password
    });

    bcrypt.genSalt(10, function(err, salt){
        bcrypt.hash(newUser.password, salt, function(err, hash){
            if(err){
                console.log(err);
            }
            newUser.password = hash;
            newUser.save(function(err){
                if(err){
                    console.log(err);
                    return;
                }else{
                    req.flash('success','You are regitered and ready to Log in');
                    res.redirect('/users/login');
                }
            });
        });
    });

	}
});

router.get('/login',function(req, res){
    res.render('login');
});

//Login Process
router.post('/login', function(req, res, next){
    passport.authenticate('local', {
        successRedirect:'/',
        failureRedirect:'login',
        failureFlash:true
    })(req, res, next);
});

// Logout

router.get('/logout', function(req, res){
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/users/login');
})


module.exports = router;