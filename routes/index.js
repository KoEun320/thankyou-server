var express = require('express');
var account = require('./account');
var postitem = require('./post');


const router = express.Router();

router.get('/', (req, res) => {
    res.json({result:'ok'});
});


router.use('/users', account);
router.use('/post', postitem);

module.exports = router;
