// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var GitHubStrategy = require('passport-github').Strategy;

// load up the user model
var User = require('../models/users');
require('dotenv').load();



module.exports = function (passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
        function (req, username, password, done) {

            if (username)
                username = username.toLowerCase(); // Use lower-case usernames/emails to avoid case-sensitive e-mail/username matching

            // asynchronous
            process.nextTick(function () {
                User.findOne({ 'local.username': username }, function (err, user) {
                    // if there are any errors, return the error
                    if (err)
                        return done(err);

                    // if no user is found, return the message
                    else if (!user) {
                            User.findOne({ 'local.email': username }, function (err, user) {
                                // if there are any errors, return the error
                                if (err)
                                    return done(err);

                                // if no user is found, return the message
                                else if (!user)
                                    return done(null, false, { message: 'Wrong password or username/email'});

                                else if (!user.validPassword(password))
                                    return done(null, false, { message: 'Wrong password or username/email'});

                                // all is well, return user
                                else
                                    return done(null, user);
                            });
                    }

                    else if (!user.validPassword(password))
                        return done(null, false, { message: 'Wrong password or username/email'});

                    // all is well, return user
                    else
                        return done(null, user);
                });
            });

        }));

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
        function (req, username, password, done) {
            console.log(req.body.email)
            let email = null;
            if (req.body.email)
                email = req.body.email.toLowerCase();
            if (username)
                username = username.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

            // asynchronous
            process.nextTick(function () {
                // if the user is not already logged in:
                if (!req.user) {
                    User.findOne({ 'local.username': username }, function (err, user) {
                        // if there are any errors, return the error
                        if (err)
                            return done(err);

                        // check to see if theres already a user with that username
                        if (user) {
                            return done(null, false, { message: 'That username is already taken.' });
                        } else {
                            // check to see if theres already a user with that email
                            if (email) {
                                
                                User.findOne({ 'local.email': email }, function (err, user) {
                                    // if there are any errors, return the error
                                    if (err)
                                        return done(err);

                                    // check to see if theres already a user with that email
                                    if (user) {
                                        return done(null, false, { message: 'That email is already taken.' });
                                    } else {
                                        // check to see if theres already a user with that email
                                        // create the user
                                        var newUser = new User();
                                        newUser.local.username = username;
                                        newUser.local.email = email;
                                        newUser.local.password = newUser.generateHash(password);
                                        newUser.name = username;
                                        newUser.save(function (err) {
                                            if (err)
                                                return done(err);

                                            return done(null, newUser);
                                        });
                                    }
                                });
                            
                            }
                            else {
                                // create the user
                                var newUser = new User();
                                newUser.local.username = username;
                                newUser.local.email = email;
                                newUser.name = username;
                                newUser.local.password = newUser.generateHash(password);
                                newUser.save(function (err) {
                                    if (err)
                                        return done(err);

                                    return done(null, newUser);
                                });
                            }
                        }

                    });
                    // if the user is logged in but has no local account...
                } else if (!req.user.local.username) {
                    // ...presumably they're trying to connect a local account
                    // BUT let's check if the username used to connect a local account is being used by another user
                    User.findOne({ 'local.username': username }, function (err, user) {
                        if (err)
                            return done(err);

                        if (user) {
                            return done(null, false, { message: 'That username is already taken.' });
                            // Using 'loginMessage instead of signupMessage because it's used by /connect/local'
                        } else {
                            var user = req.user;
                            user.local.username = username;
                            user.local.password = user.generateHash(password);
                            user.local.email = email
                            user.save(function (err) {
                                if (err)
                                    return done(err);

                                return done(null, user);
                            });
                        }
                    });
                } else {
                    // user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
                    return done(null, req.user);
                }

            });

        }));

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================

    var fbStrategy = JSON.parse(process.env.facebookAuth);
    fbStrategy.callbackURL= process.env.baseURL +  fbStrategy.callbackURL;
    fbStrategy.passReqToCallback = true;  // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    passport.use(new FacebookStrategy(fbStrategy,
        function (req, token, refreshToken, profile, done) {

            // asynchronous
            process.nextTick(function () {

                // check if the user is already logged in
                if (!req.user) {

                    User.findOne({ 'facebook.id': profile.id }, function (err, user) {
                        if (err)
                            return done(err);

                        if (user) {

                            // if there is a user id already but no token (user was linked at one point and then removed)
                            if (!user.facebook.token) {
                                user.facebook.token = token;
                                user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                                user.facebook.email = (profile.emails[0].value || '').toLowerCase();
                                

                                user.save(function (err) {
                                    if (err)
                                        return done(err);

                                    return done(null, user);
                                });
                            }

                            return done(null, user); // user found, return that user
                        } else {
                            // if there is no user, create them
                            var newUser = new User();

                            newUser.facebook.id = profile.id;
                            newUser.facebook.token = token;
                            newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                            newUser.facebook.email = (profile.emails[0].value || '').toLowerCase();
                            newUser.name = profile.name.givenName + ' ' + profile.name.familyName;

                            newUser.save(function (err) {
                                if (err)
                                    return done(err);

                                return done(null, newUser);
                            });
                        }
                    });

                } else {
                    // user already exists and is logged in, we have to link accounts
                    var user = req.user; // pull the user out of the session

                    user.facebook.id = profile.id;
                    user.facebook.token = token;
                    user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                    user.facebook.email = (profile.emails[0].value || '').toLowerCase();

                    user.save(function (err) {
                        if (err)
                            return done(err);

                        return done(null, user);
                    });

                }
            });

        }));

    // =========================================================================
    // TWITTER =================================================================
    // =========================================================================
    passport.use(new TwitterStrategy({

        consumerKey: JSON.parse(process.env.twitterAuth).consumerKey,
        consumerSecret: JSON.parse(process.env.twitterAuth).consumerSecret,
        callbackURL: process.env.baseURL + JSON.parse(process.env.twitterAuth).callbackURL,
        passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
        function (req, token, tokenSecret, profile, done) {

            // asynchronous
            process.nextTick(function () {

                // check if the user is already logged in
                if (!req.user) {

                    User.findOne({ 'twitter.id': profile.id }, function (err, user) {
                        if (err)
                            return done(err);

                        if (user) {
                            // if there is a user id already but no token (user was linked at one point and then removed)
                            if (!user.twitter.token) {
                                user.twitter.token = token;
                                user.twitter.username = profile.username;
                                user.twitter.displayName = profile.displayName;

                                user.save(function (err) {
                                    if (err)
                                        return done(err);

                                    return done(null, user);
                                });
                            }

                            return done(null, user); // user found, return that user
                        } else {
                            // if there is no user, create them
                            var newUser = new User();

                            newUser.twitter.id = profile.id;
                            newUser.twitter.token = token;
                            newUser.twitter.username = profile.username;
                            newUser.twitter.displayName = profile.displayName;
                            newUser.twitter.id = profile.username;
                            newUser.name = profile.displayName;
                            

                            newUser.save(function (err) {
                                if (err)
                                    return done(err);

                                return done(null, newUser);
                            });
                        }
                    });

                } else {
                    // user already exists and is logged in, we have to link accounts
                    var user = req.user; // pull the user out of the session

                    user.twitter.id = profile.id;
                    user.twitter.token = token;
                    user.twitter.username = profile.username;
                    user.twitter.displayName = profile.displayName;

                    user.save(function (err) {
                        if (err)
                            return done(err);

                        return done(null, user);
                    });
                }

            });

        }));

    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({

        clientID: JSON.parse(process.env.googleAuth).clientID,
        clientSecret: JSON.parse(process.env.googleAuth).clientSecret,
        callbackURL: process.env.baseURL +  JSON.parse(process.env.googleAuth).callbackURL,
        passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
        function (req, token, refreshToken, profile, done) {

            // asynchronous
            process.nextTick(function () {

                // check if the user is already logged in
                if (!req.user) {

                    User.findOne({ 'google.id': profile.id }, function (err, user) {
                        if (err)
                            return done(err);

                        if (user) {

                            // if there is a user id already but no token (user was linked at one point and then removed)
                            if (!user.google.token) {
                                user.google.token = token;
                                user.google.name = profile.displayName;
                                user.google.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email

                                user.save(function (err) {
                                    if (err)
                                        return done(err);

                                    return done(null, user);
                                });
                            }

                            return done(null, user);
                        } else {
                            var newUser = new User();

                            newUser.google.id = profile.id;
                            newUser.google.token = token;
                            newUser.google.name = profile.displayName;
                            newUser.google.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email
                            newUser.name =  profile.displayName;

                            newUser.save(function (err) {
                                if (err)
                                    return done(err);

                                return done(null, newUser);
                            });
                        }
                    });

                } else {
                    // user already exists and is logged in, we have to link accounts
                    var user = req.user; // pull the user out of the session

                    user.google.id = profile.id;
                    user.google.token = token;
                    user.google.name = profile.displayName;
                    user.google.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email

                    user.save(function (err) {
                        if (err)
                            return done(err);

                        return done(null, user);
                    });

                }

            });

        }));
        
        
    // =========================================================================
    // GITHUB ==================================================================
    // =========================================================================
        
        
    passport.use(new GitHubStrategy({
    clientID: JSON.parse(process.env.githubAuth).clientID,
    clientSecret: JSON.parse(process.env.githubAuth).clientSecret,
    callbackURL: process.env.baseURL + JSON.parse(process.env.githubAuth).callbackURL,
    passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
},
function (req, token, refreshToken, profile, done) {
                // asynchronous
            process.nextTick(function () {

                // check if the user is already logged in
                if (!req.user) {

                    User.findOne({ 'github.id': profile.id }, function (err, user) {
                        if (err)
                            return done(err);

                        if (user) {

                            // if there is a user id already but no token (user was linked at one point and then removed)
                            if (!user.github.token) {
                                user.github.token = token;
                                user.github.name = profile.displayName;
                                user.github.email = profile.email;

                                user.save(function (err) {
                                    if (err)
                                        return done(err);

                                    return done(null, user);
                                });
                            }

                            return done(null, user);
                        } else {
                            var newUser = new User();

                            newUser.github.id = profile.id;
                            newUser.github.token = token;
                            newUser.github.name = profile.displayName;
                            newUser.github.email = profile.email;
                            newUser.name = profile.displayName;

                            newUser.save(function (err) {
                                if (err)
                                    return done(err);

                                return done(null, newUser);
                            });
                        }
                    });

                } else {
                    // user already exists and is logged in, we have to link accounts
                    var user = req.user; // pull the user out of the session

                    user.github.id = profile.id;
                    user.github.token = token;
                    user.github.name = profile.displayName;
                    user.github.email = profile.email;

                    user.save(function (err) {
                        if (err)
                            return done(err);

                        return done(null, user);
                    });

                }

            });
})); 
        
        
        
        

};