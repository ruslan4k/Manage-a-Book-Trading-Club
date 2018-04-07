var path = require('path');
var appRoot = require('app-root-path');
const cors = require('./cors');
var http = require('https');
const request = require("request");
var Book = require('../models/books');

require('dotenv').load();

module.exports = function (app, passport) {

    // =============================================================================
    // AUTHENTICATE (FIRST LOGIN) ==================================================
    // =============================================================================

    // locally --------------------------------
    // LOGIN ===============================
    // process the login form

    // route middleware to ensure user is logged in
    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        else {
            console.log('You are not logged in!')
            var err = new Error('You are not logged in!');
            err.status = 403;
            next(err);
        }
    }

    app.options('*', cors.corsWithOptions)
    app.get('/books', cors.corsWithOptions, function (req, res) {
        Book.find({}, function (err, books) {
            if (err) {
                console.log(err);
                return next(err);
            }
            for (let book of books) {
                book.requestedUser = undefined
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json(books);
        });
    })

    // outgoing requests

    app.get('/pendingBooks', cors.corsWithOptions, isLoggedIn, function (req, res) {
        Book.find({ 'requestedUser': req.user._id, "isApproved": false }, function (err, books) {
            if (err) {
                console.log(err);
                return next(err);
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json(books);
        });
    })

    app.get('/approvedOutgoingBooks', cors.corsWithOptions, isLoggedIn, function (req, res) {
        Book.find({ 'requestedUser': req.user._id, "isApproved": true }, function (err, books) {
            if (err) {
                console.log(err);
                return next(err);
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json(books);
        });
    })

    // incoming requests 

    app.get('/toApproveBooks', cors.corsWithOptions, isLoggedIn, function (req, res) {
        Book.find({ 'user': req.user._id, "isRequested": true, "isApproved": false }, function (err, books) {
            if (err) {
                console.log(err);
                return next(err);
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            console.log('toApproveBooks: ', books)
            return res.json(books);
        });
    })

    app.get('/approvedBooks', cors.corsWithOptions, isLoggedIn, function (req, res) {
        Book.find({ 'user': req.user._id, "isApproved": true }, function (err, books) {
            if (err) {
                console.log(err);
                return next(err);
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json(books);
        });
    })

    app.post('/remove_request', cors.corsWithOptions, isLoggedIn, function (req, res) {
        Book.findById(req.body.id, function (err, book) {
            if (err) {
                console.log(err);
                return next(err);
            }
            book.isRequested = false;
            book.requestedUser = undefined;
            book.isApproved = false;
            book.save()
                .then((book) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({ success: true, status: 'Request succesfully deleted', book: book });
                    return
                }, (err) => {
                    console.log(err);
                    return next(err);
                });
        });
    })

    app.post('/approveTrade', cors.corsWithOptions, isLoggedIn, function (req, res) {
        Book.findById(req.body.id, function (err, book) {
            if (err) {
                console.log(err);
                return next(err);
            }
            book.isApproved = true;
            book.save()
                .then((book) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({ success: true, status: 'Request succesfully approved', book: book });
                    return
                }, (err) => {
                    console.log(err);
                    return next(err);
                });
        });
    })



    app.get('/mybooks', cors.corsWithOptions, isLoggedIn, function (req, res) {
        Book.find({ 'user': req.user._id }, function (err, books) {
            if (err) {
                console.log(err);
                return next(err);
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json(books);
        });
    })



    app.post('/book', cors.corsWithOptions, isLoggedIn, function (req, res) {
        let book = req.body.book;
        const url = "https://www.googleapis.com/books/v1/volumes?q=" + book + "&key=" + process.env.BOOK_API;
        request.get(url, (error, response, body) => {
            if (error) {
                console.log(error);
                return;
            }
            let json = JSON.parse(body);
            if (json.items && json.items[0].volumeInfo && json.items[0].volumeInfo.imageLinks) {
                let title = json.items[0].volumeInfo.title;
                let link = json.items[0].volumeInfo.imageLinks.smallThumbnail;
                let user = req.user._id
                return Book.create({ user: user, title: title, image: link, isApproved: false, isRequested: false })
                    .then((book) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        return res.json({ success: true, 'book': book });
                    }, (err) => { return res.json({ success: false, status: err }) });
            }
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.json({ success: false, status: "Book not found" });
        });
    });

    app.delete('/book/:id', cors.corsWithOptions, isLoggedIn, function (req, res) {
        Book.findByIdAndRemove(req.params.id, function (err, book) {
            if (err) {
                return res.json({ success: false, status: err })
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({ success: false, status: 'Book succesfully deleted', book: book });
            return;
        });
    });

    app.get('/book/:id', cors.corsWithOptions, isLoggedIn, function (req, res) {
        Book.findById(req.params.id, function (err, book) {
            if (err) {
                return res.json({ success: false, status: err })
            }
            if (book.isRequested) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                return res.json({ success: false, status: "Sorry, this Book cannot be traded, it's already requested by someone else." });
            }
            if (book.user == req.user._id) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                return res.json({ success: false, status: "Sorry, this Book cannot be traded, it's your book." });
            }
            book.requestedUser = req.user._id;
            book.isRequested = true;
            book.save()
                .then((book) => {
                    book.requestedUser = undefined;
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({ success: true, status: 'Book succesfully requested', book: book });
                    return
                }, (err) => {
                    console.log(err);
                    return next(err);
                });
        });
    });

    app.get('/username', cors.corsWithOptions, isLoggedIn, function (req, res) {
        return res.json({ user: { name: req.user.name, id: req.user._id } })
    });


    app.get('/logout', cors.corsWithOptions, function (req, res) {
        req.logout();
        res.statusCode = 200;
        res.json({ success: true, status: 'You have successfully logged out!' })
    });



    app.post('/login', cors.corsWithOptions, function (req, res, next) {
        passport.authenticate('local-login', function (err, user, info) {
            if (err) {
                console.log(err);
                return next(err);
            }
            if (user) {
                req.logIn(user, function (err) {

                    if (err) {
                        console.log('error when logging in');
                        return next(err);
                    }
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({ success: true, status: 'You have successfully signed in!', user: { name: req.user.name, id: req.user._id } });
                    return
                });
            }
            else {
                res.statusCode = 401;
                res.setHeader('Content-Type', 'application/json');
                res.json({ success: false, status: info.message });
                return;

            }

        })(req, res, next);
    });

    // SIGNUP =================================
    // process the signup form
    app.post('/signup', cors.corsWithOptions, function (req, res, next) {
        passport.authenticate('local-signup', function (err, user, info) {
            if (err) {
                console.log(err);
                return next(err);
            }
            if (user) {
                req.logIn(user, function (err) {
                    if (err) { return next(err); }
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({ success: true, status: 'You have successfully signed up!', user: { name: req.user.name, id: req.user._id } });
                    return
                });
            }
            else {
                res.statusCode = 401;
                res.setHeader('Content-Type', 'application/json');
                res.json({ success: false, status: info.message });
            }

        })(req, res, next);
    });


    // facebook -------------------------------

    // send to facebook to do the authentication
    app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['public_profile', 'email'] }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/mybooks',
            failureRedirect: '/login'
        }));

    // twitter --------------------------------

    // send to twitter to do the authentication
    app.get('/auth/twitter', cors.corsWithOptions, passport.authenticate('twitter', { scope: 'email' }))

    // handle the callback after twitter has authenticated the user
    app.get('/auth/twitter/callback', passport.authenticate('twitter', {
        successRedirect: '/mybooks',
        failureRedirect: '/login'
    }));


    // google ---------------------------------

    // send to google to do the authentication
    app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect: '/mybooks',
            failureRedirect: '/login'
        }));

    // github ---------------------------------

    // send to google to do the authentication
    app.get('/auth/github', passport.authenticate('github', { scope: ['profile', 'email'] }));

    // the callback after google has authenticated the user
    app.get('/auth/github/callback',
        passport.authenticate('github', {
            successRedirect: '/mybooks',
            failureRedirect: '/login'
        }));


    app.get('*', cors.corsWithOptions, (req, res) => {
        res.sendFile(path.join(appRoot.path, 'dist/index.html'));
    });

}
