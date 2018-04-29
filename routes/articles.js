const express = require('express');
const router = express.Router();

// bring in article model
let Article = require('../models/article');

// bring in user model
let User = require('../models/user');


router.get('/add', ensureAuthenticated, function(req, res){
    res.render('add_articles', {
        title:'Add Article'
    });
});

//Add submit Post route
router.post('/add', function(req, res){

	req.checkBody('title', 'Title is required').notEmpty();
	//req.checkBody('author', 'author cant be empty').notEmpty();
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
		article.author = req.user._id;
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

router.get('/edit/:id',ensureAuthenticated, function(req, res){
	Article.findById(req.params.id, function(err, article){
		if(article.author != req.user._id){
			req.flash('danger', 'Not Authorized');
			res.redirect('/');
		}
		res.render('edit_article', {
			title:'edit article',
        	article:article
    	});
	});
});

//update submit

router.post('/edit/:id', function(req, res){

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

router.delete('/:id', function(req, res){
	if(!req.user._id){
		res.status(500).send();
	}
	let query = {_id:req.params.id}

	Article.findById(req.params.id, function(err, article){
		if(article.author != req.user._id){
			res.status(500).send();
		} else {
			Article.remove(query, function(err){
				if(err){
					console.log(err);
				}
				res.send('Success');
			});
		}
	});
	/*
	Article.remove(query, function(err){
		if(err){
			console.log(err);
		}
		res.send('Success');
	});
	*/
});

// get single article

router.get('/:id', function(req, res){
	Article.findById(req.params.id, function(err, article){
		User.findById(article.author, function(err, user){
			res.render('article', {
        		article:article,
				author: user.name
    		});
		});		
	});
});

// access control
function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		req.flash('danger', 'Please Login');
		res.redirect('/users/login');
	}
}

module.exports = router;
