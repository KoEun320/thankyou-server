var express = require('express');
var async = require('async');
var Post = require('../models/Post');
var _ = require('lodash');
var cors = require('cors');

var router = express.Router();

var corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

/*
    POSTITEM registeration: POST /post/register
    BODY SAMPLE: { "email": "test@test.com", "password": "test" }
*/
router.options('/register', cors(corsOptions), (req, res) => { res.status(200).end(); });

router.post('/register', cors(corsOptions), (req, res) => {
    // CREATE ACCOUNT
    let post = new Post({
        writerId: req.body.user.id,
        writer: req.body.user.username,
        content: req.body.post.content,
        isPublic: req.body.post.isPublic,
        imgUrl: req.body.post.imgUrl,
        created: req.body.post.created
    });

    // SAVE IN THE DATABASE
    post.save( err => {
        if(err) throw err;
        return res.json({ ok: true});
    });
});

/*
    GET PAGE LIST /post/getall/:pageNumber
*/
router.options('/getall/:page', cors(corsOptions), (req, res) => { res.status(200).end(); });

router.get('/getall/:page',cors(corsOptions), function (req, res) {
    var pageNumber = Number(req.params.page);
    // 페이지 컨텐츠 개수 설정
    var contentSize = 10;
    // 다음 페이지 갈 때 건너뛸 컨텐츠 개수 구하기
    var skipSize = (pageNumber - 1)*contentSize;
    var paginationTotal,itemtotalCount,postItems;

    async.waterfall([
        function(callback){
            // 컬렉션에 총 글 개수를 넘깁니다. (만약 해당 글에 조건이 있을 경우 카운트도 마찬가지로 조건을 동일하게)
            Post.find({isPublic: true}).count(function(err, totalCount){
                console.log("totalCount:" +totalCount)
            callback(null, totalCount);
            });
        },
        function(totalCount,callback){
        itemtotalCount = totalCount;
        // 페이지네이션의 전체 카운트 구하기
        paginationTotal = Math.ceil(itemtotalCount/contentSize);

        Post.find({isPublic: true}).sort({_id: -1})
        .skip(skipSize) // 건너뛸 개수
        .limit(contentSize) // 컨텐츠 개수
        .exec(function(err, posts){
            postItems = {
                contents: posts,
                paginationTotal: paginationTotal
            };
            callback(null, postItems);
        });
        }
    ],function(err, postItems){
        console.log('All post.contents.length: '+ postItems.contents.length);
        if (err) {
            throw err;
        } else if (postItems.contents.length > 0 || !undefined ) {
            res.json({contents: postItems.contents, paginationTotal: postItems.paginationTotal});
        } else {
            res.json({result: false});
        }
    });
});


/*
    GET PAGE by User LIST GET /post/:userId/:pageNumber
*/
router.options('/:userId/:page', cors(corsOptions), (req, res) => { res.status(200).end(); });

router.get('/:userId/:page',cors(corsOptions), function (req, res) {
    console.log(req.params)
    var userId = req.params.userId;
    var pageNumber = Number(req.params.page);
    // 페이지 컨텐츠 개수 설정
    var contentSize = 10;
    // 다음 페이지 갈 때 건너뛸 컨텐츠 개수 구하기
    var skipSize = (pageNumber - 1)*contentSize;
    var paginationTotal,itemtotalCount,postItems;

    async.waterfall([
        function(callback){
            // by UserId total count & like count
            Post.aggregate([
                {'$match' : {'writerId' : userId}},
                {'$group' : {'_id' : 'null', 'totalCount' : {'$sum' : 1},'likeCount' : {'$sum' : '$like'}}}
            ]).exec(function (err, count){
                if(count.length === 0) {
                    item = {
                        _id : 'null',
                        totalCount: 0,
                        likeCount: 0

                    }

                    count.push(item);

                }
                callback(null, count)
            });
        },
        function(count,callback){
            itemtotalCount = count[0].totalCount;
            likeCount = count[0].likeCount;

            console.log('itemtotalCount:'+itemtotalCount + ' likeCount:' +  likeCount);

            // get pagination totalcount
            paginationTotal = Math.ceil(itemtotalCount/contentSize);

            Post.find({writerId: userId}).sort({_id: -1})
            .skip(skipSize) // 건너뛸 개수
            .limit(contentSize) // 컨텐츠 개수
            .exec(function(err, posts){
                postItems = {
                contents: posts,
                paginationTotal: paginationTotal,
                totalCount: itemtotalCount,
                likeCount: likeCount
                };
                callback(null, postItems);
            });

        }
    ],function(err, postItems){
        console.log("By Id post contents length: " + postItems.contents.length )
        if (err) {
            throw err;
        } else {
            res.json({contents: postItems.contents, paginationTotal: postItems.paginationTotal, totalCount: postItems.totalCount, likeCount: postItems.likeCount});
        }
    });
});
/*
    Get Random post except own post GET post/:userId
*/
router.options('/:userId', cors(corsOptions), (req, res) => { res.status(200).end(); });

router.get('/:userId',cors(corsOptions), function (req, res) {
    var userId = req.params.userId;

    Post.aggregate([
        { $match: { 'writerId': {$ne: userId}, 'isPublic' : true} },
        { $sample: {size: 1} }
    ]).exec(function(err, item){
        if(err) {
            throw err
        } else if(item[0]){
            res.json(item[0]);
        } else {
            res.status(403).end();
        }
    });
});


/*
    put User post except own post PUT post/:postId
*/
router.options('/:postId', cors(corsOptions), (req, res) => { res.status(200).end(); });

router.put('/:postId', cors(corsOptions), function(req, res) {
    console.log(req.body)
    Post.findByIdAndUpdate(req.params.postId,
        {   content: req.body.content,
            isPublic: req.body.isPublic,
            imgUrl: req.body.imgUrl,
            new: true
        },function (err, post) {
            if (err) throw err;
            console.log('update')
            console.log(post)
            if(post) {
                res.json(post);
            }else{
                res.status(403).end();
            }
    })
});

router.options('/:postId/like/:userId', cors(corsOptions), (req, res) => { res.status(200).end(); });

router.put('/:postId/like/:userId', cors(corsOptions), function(req, res) {

    Post.findByIdAndUpdate(req.params.postId,
        {   $inc: { like : 1 },
            $push: { likeId:  req.params.userId },
        }, { upsert: true}, function(err, post) {
            if (err) throw err;
            console.log('like')
            console.log(post)
            res.json(post);
    })
});


router.options('/:postId/dislike/:userId', cors(corsOptions), (req, res) => { res.status(200).end(); });

router.put('/:postId/dislike/:userId', cors(corsOptions), (req, res) => {
    console.log(req.params);
    Post.findByIdAndUpdate(req.params.postId,
        {   $inc: { like : -1 },
            $pull: { likeId:  req.params.userId },
        },function (err, post) {
            console.log('dislike')
            console.log(post)
            if (err) throw err;
            res.json(post);
    });
});

router.delete('/:id', cors(corsOptions), async (req, res) => {
    const postId = req.params.id;

    try {
        await Post.findOneAndRemove({ _id: postId });

        res.status(200).json({
            message: `Successfully Deleted User ${postId}`
        });
    } catch (error) {
        res.status(400).json({
            error: `Could not delete User ${postId}`
        });
    }
});


module.exports = router;
