const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const router = new express.Router()
const Tweet = require('../Models/tweet')
const auth = require('../middleware/auth')

// Helper Functions

const upload = multer({})



router.post('/tweets', auth, async (req, res) => {
    // 
    const tweet = new Tweet({
        ...req.body,  // This spreads in the text and image from the client
        user: req.user.name,  // Add the user's name from auth
        username: req.user.username,  // Add the username from auth
        userID: req.user.id
    })

    try {
        await tweet.save()
        res.status(201).send(tweet)
    }
    catch (e) {
        res.status(400).send(e)
    }
})


// Add image to tweet 

router.post('/uploadTweetImage/:Id', auth, upload.single('image'), async (req, res) => {
    try {
        const tweet = await Tweet.findById(req.params.Id.trim())

        if (!tweet) {
            return res.status(404).send({ error: 'Tweet not found' })
        }

        const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
        tweet.image = buffer
        await tweet.save()
        res.send(tweet)
    } catch (e) {
        res.status(500).send(e)
    }
}, (error, _req, res, _next) => {
    res.status(400).send({ error: error.message })
})

//Fetch tweets

router.get('/tweets', async (req, res) => {
    try {
        const tweets = await Tweet.find({})
        res.send(tweets)
    }
    catch (e) {
        res.status(500).send(e)
    }
})

//Fetch specific Users tweets 

router.get('/tweets/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const tweet = await Tweet.find({ user: _id })
        if (!tweet) {
            return res.status(404).send({ error: 'Tweet not found' })
        }
        res.send(tweet)
    }
    catch (e) {
        res.status(500).send(e)
    }
})

//Fetch Tweet Image

router.get('/tweets/:id/image', async (req, res) => {
    try {
        const tweet = await Tweet.findById(req.params.id)
        if (!tweet || !tweet.image) {
            return res.status(404).send({ error: 'Tweet or image not found' })
        }
        res.set('Content-Type', 'image/png')  // Changed to png since you're storing as png
        res.send(tweet.image)
    }
    catch (e) {
        res.status(500).send(e)
    }
})

// Like Tweet Function

router.put('/tweets/:id/like', auth, async (req, res) => {
    try {
        const tweet = await Tweet.findById(req.params.id)

        if (!tweet) {
            return res.status(404).json({ error: 'Tweet not found' })
        }

        if (!tweet.likes.includes(req.user.id)) {
            tweet.likes.push(req.user.id)
            await tweet.save()
            res.status(200).json({
                message: 'Post has been liked',
                totalLikes: tweet.likes.length
            })
        } else {
            res.status(400).json({ message: 'Post has already been liked' })
        }
    } catch (e) {
        res.status(500).json({ error: 'An error occurred' })
    }
})

//Unlike

router.put('/tweets/:id/unlike', auth, async (req, res) => {
    try {
        const tweet = await Tweet.findById(req.params.id)

        if (!tweet) {
            return res.status(404).json({ error: 'Tweet not found' })
        }

        if (tweet.likes.includes(req.user.id)) {
            tweet.likes = tweet.likes.filter(id => id !== req.user.id)
            await tweet.save()
            res.status(200).json({
                message: 'Post has been unliked',
                totalLikes: tweet.likes.length
            })
        } else {
            res.status(400).json({ message: 'Post has not been liked' })
        }
    } catch (e) {
        res.status(500).json({ error: 'An error occurred' })
    }
})

module.exports = router
