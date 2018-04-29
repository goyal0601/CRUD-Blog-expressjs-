"use strict"

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const passport = require('passport');
const config = require('./config/database');


mongoose.connect(config.database);
//mongoose.connect('mongodb://localhost/nodekb');
let db = mongoose.connection;

//check for db errors

db.once('open', function(){
	console.log('connected to mongodb');
});
db.on('error', function(err){
	console.log(err);
});

//init app
const app = express();

// bring in models
let Article = require('./models/article');

//load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// body parser middleware

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

//express session middleware

app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
}));

//express messages middleware

app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//express validator middleware

app.use(expressValidator({
	errorFormatter: function(param, msg, value, location) {
		var namespace = param.split('.')
		, root   =  namespace.shift()
		, formParam = root;

		while(namespace.length) {
			formParam += '[' + namespace.shift() + ']';
		}
		return {
			param : formParam,
			msg   : msg,
			value : value,
			location: location
		};
	}
}));

// passport config
require('./config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
	res.locals.user = req.user || null;
	next();
});

app.get('/', function(req, res){
	/*
    let articles = [
	{
        id:1,
        title:'Article one',
		author:'Jeff',
		body:'this is article one'
	},
	{
		id:2,
        title:'Article two',
		author:'Jefferson',
		body:'this is article two'
	},
	{
		id:3,
        title:'Article three',
		author:'Jeffery',
		body:'this is article three'
	}
]
*/
	Article.find({}, function(err, articles){
		if(err){
			console.log(err);
		}else{
			res.render('index', {
				title:'Hello',
				articles: articles
			});
		}

	});
});
/*
// get single article

app.get('/article/:id', function(req, res){
	Article.findById(req.params.id, function(err, article){
		res.render('article', {
        	article:article
    	});
	});
});

app.get('/articles/add', function(req, res){
    res.render('add_articles', {
        title:'Add Article'
    });
});

//Add submit Post route
app.post('/articles/add', function(req, res){

	req.checkBody('title', 'Title is required').notEmpty();
	req.checkBody('author', 'author cant be empty').notEmpty();
	req.checkBody('body', 'please write something about it').notEmpty();

	var errors  = req.validationErrors();

	if(errors){
		res.render('add_articles', {
			title:'Add Article',
			errors: errors
		});
	}
	else{
		let article = new Article();
		article.title = req.body.title;
		article.author = req.body.author;
		article.body = req.body.body;

		article.save(function(err){
			if(err){
				console.log(err);
			}else{
				req.flash('success','Article Added');
				res.redirect('/');
			}
		});
	}
});


//edit the article

app.get('/article/edit/:id', function(req, res){
	Article.findById(req.params.id, function(err, article){
		res.render('edit_article', {
			title:'edit article',
        	article:article
    	});
	});
});

//update submit

app.post('/articles/edit/:id', function(req, res){

	req.checkBody('title', 'Title is required').notEmpty();
	req.checkBody('author', 'author cant be empty').notEmpty();
	req.checkBody('body', 'please write something about it').notEmpty();

	var errors  = req.validationErrors();

	if(errors){
		Article.findById(req.params.id, function(err, article){
			res.render('edit_article', {
				title:'edit article',
				article:article,
				errors:errors
			});
		});
	}else{
		let article = {};
		article.title = req.body.title;
		article.author = req.body.author;
		article.body = req.body.body;

		let query = {_id:req.params.id}

		Article.update(query, article, function(err){
			if(err){
				console.log(err);
			}else{
				req.flash('success','Article Updated');
				res.redirect('/');
			}
		});
	}
});

app.delete('/article/:id', function(req, res){
	let query = {_id:req.params.id}

	Article.remove(query, function(err){
		if(err){
			console.log(err);
		}
		res.send('Success');
	});
});
*/

// route files
let articles = require('./routes/articles');
app.use('/articles', articles);

let users = require('./routes/users');
app.use('/users', users);

// start server
app.listen(3000, function(){
    console.log('server started on 3000');
});
