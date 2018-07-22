var express = require('express');
var jwt = require('jsonwebtoken');
var Account = require('../models/Account');
var auth = require('../authMiddleware/auth');
var config = require('../config');
var cors = require('cors');

var router = express.Router();

var corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

/*
    ACCOUNT SIGNUP: POST /users/register
    BODY SAMPLE: { "email": "test@test.com", "password": "test" }
    ERROR CODES:
        1: BAD USERNAME
        2: BAD PASSWORD
        3: USERNAM EXISTS
*/
router.options('/register', cors(corsOptions), (req, res) => { res.status(200).end(); });

router.post('/register',cors(corsOptions), (req, res) => {
    // CHECK USERNAME FORMAT
    let usernameRegex = /^[a-z0-9]+$/;

    if(!usernameRegex.test(req.body.username)) {
        return res.status(400).json({
            error: "BAD USERNAME",
            code: 1
        });
    }

    // CHECK PASS LENGTH
    if(req.body.password.length < 4 || typeof req.body.password !== "string") {
        return res.status(400).json({
            error: "BAD PASSWORD",
            code: 2
        });
    }

    // CHECK USER EXISTANCE
    Account.findOne({ email: req.body.email }).exec((err, exists) => {
        if (err) throw err;
        if(exists){
            return res.status(409).json({
                error: "USERNAME EXISTS",
                code: 3
            });
        }

        // CREATE ACCOUNT
        let account = new Account({
            email: req.body.email,
            username: req.body.username,
            password: req.body.password
        });

        account.password = account.generateHash(account.password);

        // SAVE IN THE DATABASE
        account.save( err => {
            if(err) throw err;
            return res.json({ ok: true});
        });
    });
});

/*
    ACCOUNT SIGNIN: POST /users/authenticate
    BODY SAMPLE: { "email" : "12@123.com", "username": "test", "password": "test" }
    ERROR CODES:
        1: LOGIN FAILED
*/
router.options('/authenticate', cors(corsOptions), (req, res) => { res.status(200).end();});

router.post('/authenticate',cors(corsOptions), (req, res) => {
    //console.log(req.body)
    // find the user
    Account.findOne({email: req.body.email}, (error, user) => {
        //console.log(user)
        if(error) throw error;

        // CHECK ACCOUNT EXISTANCY
        if(!user) {
            return res.status(401).json({
                error: "LOGIN FAILED",
                code: 1
            });
        }

        // CHECK WHETHER THE PASSWORD IS VALID
        if(!user.validateHash(req.body.password)) {
            return res.status(401).json({
                error: "LOGIN FAILED",
                code: 1
            });
        }

        // create a token
        var createToken = jwt.sign({ id: user._id, username: user.username }, config.development.secret, {
            expiresIn: 86400 // expires in 24 hours
        });

        return res.json({id: user._id, username: user.username, token: createToken });
    });
});

/*
    GET CURRENT USER INFO GET /account/getInfo
*/
router.use('/getinfo', auth);
router.options('/getinfo', cors(corsOptions), (req, res) => { res.status(200).end(); });
router.get('/getinfo',cors(corsOptions), (req, res) => {
    //console.log('req.decoded')
    //console.log(req.decoded)
    res.json(req.decoded);
});

/*
    LOGOUT: POST /account/logout
*/
router.options('/logout', cors(corsOptions), (req, res) => { res.status(200).end(); });
router.post('/logout',cors(corsOptions), (req, res) => {
    req.session.destroy(err => { if(err) throw err; });
    return res.json({ sucess: true });
});

router.options('/:id', cors(corsOptions), (req, res) => { res.status(200).end(); });
router.put('/:id',cors(corsOptions), (req, res) => {
    console.log(req.body.id)
    Account.findOne({_id : req.body.id}).exec((err, account) => {
        console.log(account);
        account.username = req.body.username;

        if(err) throw Error;

        // SAVE IN THE DATABASE
        account.save( err => {
            if(err) throw err;
            return res.json({
                username: account.username,
                id: account._id
            });
        });

    });
});

router.options('/:id', cors(corsOptions), (req, res) => { res.status(200).end(); });
router.delete('/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        await Account.findOneAndRemove({ _id: userId });

        res.status(200).json({
            message: `Successfully Deleted User ${userId}`
        });
    } catch (error) {
        res.status(400).json({
            error: `Could not delete User ${userId}`
        });
    }
});

module.exports = router;
