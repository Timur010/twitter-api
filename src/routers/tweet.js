const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const Tweet = require('../models/tweet')

// new router
const router = new express.Router();
const auth = require('../middleware/auth');

const upload = multer({
    limits: {
        fieldSize: 100000000
    }
})

router.post('/uploadTweetImage/:id', auth, upload.single('upload'), async(req, res) => {
    const tweet = await Tweet.findOne({_id: req.params.id})

    if (!tweet) {
        throw new Error('Публиккция не найдена')
    }

    const buffer = await sharp(req.file.buffer).resize({width: 500, height: 350}).png().toBuffer()
    tweet.image = buffer
    await tweet.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

// Post tweet router 
router.post('/tweets', auth, async (req, res) => {
    const tweet = new Tweet({
        ...req.body,
        user: req.user._id
    })

    try {
        await tweet.save()
        res.status(201).send(tweet);
    }
    catch (err) {
        res.status(400).send(err)
    }
})

router.get('/tweets', async(req, res) => {
    try {
        const tweets = await Tweet.find({}).sort({createdAt: - 1})
        res.send(tweets)
    }
    catch (err) {
        res.status(500).send(err)
    }
})

router.get('/tweets/:id/image', async (req, res) => {
    try {
        const tweet = await Tweet.findById(req.params.id)
        if (!tweet && !tweet.image) {
            throw new Error("изображения нет")
        }
        res.set('Content-Type', 'image/jpg')
        res.send(tweet.image)
    } 
    catch (e) {
        res.status(400).send(e)
    }
   
})
module.exports = router;
